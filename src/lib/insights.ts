// AI Insight Engine — generates live teacher insights
// and peer-matching suggestions using Claude.

import { db } from "./db";
import { getAnthropic, MODELS } from "./anthropic";

interface ClassSnapshot {
  className: string;
  studentCount: number;
  students: Array<{
    id: string;
    name: string;
    lastSeenDaysAgo: number;
    latestMood: number | null;
    latestBlocker: string | null;
    submissionsLast7d: number;
    masteredLast7d: number;
    strugglingSkills: string[];
    strongSkills: string[];
  }>;
  recentSubmissions: Array<{
    studentName: string;
    assignmentTitle: string;
    status: string;
    daysAgo: number;
  }>;
}

export async function buildClassSnapshot(classId: string): Promise<ClassSnapshot> {
  const klass = await db.class.findUnique({
    where: { id: classId },
    include: {
      enrollments: {
        where: { status: "ACTIVE" },
        include: {
          student: {
            include: {
              checkins: { orderBy: { createdAt: "desc" }, take: 3 },
              submissions: {
                where: {
                  submittedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
                },
                include: { assignment: true },
              },
              skillProfile: {
                include: { skill: true },
                orderBy: { proficiency: "desc" },
              },
            },
          },
        },
      },
    },
  });

  if (!klass) throw new Error("Class not found");

  const now = Date.now();

  return {
    className: klass.name,
    studentCount: klass.enrollments.length,
    students: klass.enrollments.map((e) => {
      const s = e.student;
      const lastSeen = s.lastSeenAt.getTime();
      const latestCheckin = s.checkins[0];
      const submissionsLast7d = s.submissions.length;
      const masteredLast7d = s.submissions.filter((x) => x.status === "MASTERED").length;
      const strong = s.skillProfile.filter((p) => p.proficiency >= 70).map((p) => p.skill.nameNl);
      const struggling = s.skillProfile.filter((p) => p.proficiency < 40).map((p) => p.skill.nameNl);
      return {
        id: s.id,
        name: s.name,
        lastSeenDaysAgo: Math.floor((now - lastSeen) / 86400000),
        latestMood: latestCheckin?.mood ?? null,
        latestBlocker: latestCheckin?.blocker ?? null,
        submissionsLast7d,
        masteredLast7d,
        strugglingSkills: struggling.slice(0, 5),
        strongSkills: strong.slice(0, 5),
      };
    }),
    recentSubmissions: klass.enrollments
      .flatMap((e) =>
        e.student.submissions.map((sub) => ({
          studentName: e.student.name,
          assignmentTitle: sub.assignment.titleNl,
          status: sub.status,
          daysAgo: Math.floor((now - sub.submittedAt.getTime()) / 86400000),
        }))
      )
      .slice(0, 20),
  };
}

export async function generateClassInsights(classId: string): Promise<number> {
  const snapshot = await buildClassSnapshot(classId);
  const anthropic = getAnthropic();

  const systemPrompt = `You are an AI co-teacher for a maker/tech education program (Dream Academy).
You review a class snapshot and produce 3-6 actionable, concise insights for the teacher.

Write in Dutch. Each insight must have:
- A short title (max 80 chars)
- A body (max 300 chars) with the observation + suggested action
- A priority (LOW, MEDIUM, HIGH, URGENT)
- A type: "stuck" (a student who needs help), "excelling" (a student to celebrate/deploy as mentor), "pattern" (class-wide trend), "intervention" (at-risk student), "pair" (pair recommendation)
- Optional studentId if it's about one specific student

Prioritize signals in this order:
1. Students who have disappeared (not seen 5+ days)
2. Students with low mood AND blocker text
3. Students who just mastered something hard (celebrate + use as mentor)
4. Class-wide patterns (multiple students stuck on same thing)
5. Pair opportunities (one strong, one struggling on same skill)

Return strict JSON, no prose:
{
  "insights": [
    { "title": "...", "body": "...", "priority": "HIGH", "type": "stuck", "studentId": "..." | null }
  ]
}`;

  const userPrompt = `Class snapshot:\n${JSON.stringify(snapshot, null, 2)}`;

  const resp = await anthropic.messages.create({
    model: MODELS.standard,
    max_tokens: 1500,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = resp.content.find((c) => c.type === "text")?.text ?? "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return 0;

  let parsed: { insights: Array<{ title: string; body: string; priority: string; type: string; studentId?: string | null }> };
  try {
    parsed = JSON.parse(match[0]);
  } catch {
    return 0;
  }

  const created = await db.$transaction(
    parsed.insights.map((i) =>
      db.insight.create({
        data: {
          scope: i.studentId ? "STUDENT" : "CLASS",
          classId,
          studentId: i.studentId || null,
          priority: i.priority,
          type: i.type,
          title: i.title,
          body: i.body,
        },
      })
    )
  );

  return created.length;
}

// ─── PEER MATCHING ───────────────────────────────────

export async function findPeerMatches(studentId: string, classId: string): Promise<number> {
  const student = await db.user.findUnique({
    where: { id: studentId },
    include: { skillProfile: { include: { skill: true } } },
  });
  if (!student) return 0;

  const strugglingSkills = student.skillProfile
    .filter((p) => p.proficiency < 40)
    .sort((a, b) => a.proficiency - b.proficiency)
    .slice(0, 3);

  if (strugglingSkills.length === 0) return 0;

  let created = 0;

  for (const struggle of strugglingSkills) {
    const candidates = await db.user.findMany({
      where: {
        role: "STUDENT",
        mentorOptIn: true,
        id: { not: studentId },
        enrollments: { some: { classId, status: "ACTIVE" } },
        skillProfile: {
          some: { skillId: struggle.skillId, proficiency: { gte: 70 } },
        },
        lastSeenAt: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
      },
      include: {
        skillProfile: { where: { skillId: struggle.skillId } },
      },
      take: 3,
    });

    for (const candidate of candidates) {
      const prof = candidate.skillProfile[0]?.proficiency ?? 0;
      const score = Math.min(100, prof + (prof - struggle.proficiency));

      await db.peerSuggestion.upsert({
        where: { id: `${studentId}_${candidate.id}_${struggle.skillId}` },
        create: {
          id: `${studentId}_${candidate.id}_${struggle.skillId}`,
          fromStudentId: studentId,
          toStudentId: candidate.id,
          skillSlug: struggle.skill.slug,
          reason: `${candidate.name} excels at ${struggle.skill.nameNl} (${prof}/100) and could help you improve.`,
          score,
          status: "SUGGESTED",
        },
        update: { score },
      });
      created++;
    }
  }

  return created;
}
