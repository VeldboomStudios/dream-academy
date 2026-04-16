import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

import { ArrowUpRight, LogOut, HandHelping, Heart, ArrowRight } from "lucide-react";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Hex } from "@/components/Honeycomb";

export default async function StudentDashboard() {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") redirect("/auth/login");

  const student = await db.user.findUnique({
    where: { id: session.userId },
    include: {
      enrollments: {
        where: { status: "ACTIVE" },
        include: {
          class: {
            include: {
              classCourses: { include: { course: true } },
            },
          },
        },
      },
      skillProfile: {
        include: { skill: true },
        orderBy: { proficiency: "desc" },
      },
      peerMatchesOut: {
        where: { status: "SUGGESTED" },
        include: { toStudent: true },
        orderBy: { score: "desc" },
        take: 5,
      },
      peerMatchesIn: {
        where: { status: { in: ["SUGGESTED", "CONTACTED"] } },
        include: { fromStudent: true },
        take: 5,
      },
      badgesEarned: { include: { badge: true } },
      checkins: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!student) redirect("/auth/login");

  const strong = student.skillProfile.filter((p) => p.proficiency >= 70);
  const struggling = student.skillProfile.filter((p) => p.proficiency < 40);
  const firstName = student.name.split(" ")[0];

  return (
    <main className="min-h-screen">
      <DashNav name={student.name} role="Student" />

      <section className="px-6 md:px-10 py-12 md:py-16">
        <div className="mx-auto max-w-[1440px]">
          {/* Header */}
          <div className="flex items-center justify-between rule-b pb-5 mb-12">
            <div className="flex items-center gap-4 text-label text-muted">
              <span className="numerals">
                {new Date().toLocaleDateString("nl-NL", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
              <Hex size={10} className="text-honey" filled />
              <span>Jouw werkplek</span>
            </div>
            <Link
              href="/student/checkin"
              className="inline-flex items-center gap-2 text-label text-paper hover:text-honey-deep transition-colors"
            >
              <Heart size={12} />
              Check-in
            </Link>
          </div>

          {/* Hero greeting */}
          <div className="grid grid-cols-12 gap-6 md:gap-10 mb-20 md:mb-24">
            <div className="col-span-12 lg:col-span-8">
              <p className="text-label text-honey-deep mb-6">— {greetingNl()}</p>
              <h1
                className="text-display text-paper mb-6"
                style={{ fontSize: "clamp(2.5rem, 7vw, 6rem)" }}
              >
                Hoi, <span className="italic font-light"
                  style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144' }}>{firstName}</span>
                <span className="text-honey">.</span>
              </h1>
              <p className="text-xl text-paper/80 font-display italic font-light leading-tight max-w-2xl"
                style={{ fontVariationSettings: '"SOFT" 80, "WONK" 0, "opsz" 144' }}>
                Klaar om vandaag iets te maken?
              </p>
            </div>
            <div className="col-span-12 lg:col-span-4 lg:pl-10 lg:border-l lg:border-rule-2 lg:self-end">
              <div className="space-y-4">
                <MiniStat label="Badges" value={student.badgesEarned.length} />
                <MiniStat label="Sterke vaardigheden" value={strong.length} />
                <MiniStat label="In ontwikkeling" value={struggling.length} />
              </div>
            </div>
          </div>

          {/* Peer suggestions OUT */}
          {student.peerMatchesOut.length > 0 && (
            <div className="mb-20">
              <div className="flex items-end justify-between rule-b pb-5 mb-8">
                <div>
                  <p className="text-label text-muted mb-2">Klasgenoten die je kunnen helpen</p>
                  <h2 className="font-display text-3xl md:text-4xl leading-none">
                    Vraag om <span className="italic font-light"
                      style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144' }}>hulp</span>.
                  </h2>
                </div>
                <span className="text-label-mono text-muted">
                  {String(student.peerMatchesOut.length).padStart(2, "0")}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {student.peerMatchesOut.map((m) => (
                  <PeerHelpCard
                    key={m.id}
                    id={m.id}
                    name={m.toStudent.name}
                    reason={m.reason}
                    score={m.score}
                    skill={m.skillSlug}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Peer suggestions IN */}
          {student.peerMatchesIn.length > 0 && (
            <div className="mb-20">
              <div className="flex items-end justify-between rule-b pb-5 mb-8">
                <div>
                  <p className="text-label text-muted mb-2">Jij kunt helpen</p>
                  <h2 className="font-display text-3xl md:text-4xl leading-none">
                    Jouw <span className="italic font-light"
                      style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144' }}>kracht</span> zoeken ze.
                  </h2>
                </div>
                <span className="text-label-mono text-muted">
                  {String(student.peerMatchesIn.length).padStart(2, "0")}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {student.peerMatchesIn.map((m) => (
                  <PeerGiveCard
                    key={m.id}
                    name={m.fromStudent.name}
                    skill={m.skillSlug}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Skill bars */}
          <div className="grid grid-cols-12 gap-6 md:gap-10 mb-20">
            <div className="col-span-12 lg:col-span-6">
              <div className="flex items-end justify-between rule-b pb-5 mb-6">
                <h2 className="text-label text-muted">Sterke kanten</h2>
                <span className="text-label-mono text-muted">
                  {String(strong.length).padStart(2, "0")}
                </span>
              </div>
              {strong.length === 0 ? (
                <p className="text-muted text-sm">Nog aan het ontdekken — doe wat cursussen.</p>
              ) : (
                <div className="space-y-5">
                  {strong.slice(0, 8).map((p) => (
                    <SkillBar key={p.id} name={p.skill.nameNl} value={p.proficiency} color="honey" />
                  ))}
                </div>
              )}
            </div>

            <div className="col-span-12 lg:col-span-6">
              <div className="flex items-end justify-between rule-b pb-5 mb-6">
                <h2 className="text-label text-muted">In ontwikkeling</h2>
                <span className="text-label-mono text-muted">
                  {String(struggling.length).padStart(2, "0")}
                </span>
              </div>
              {struggling.length === 0 ? (
                <p className="text-muted text-sm">Alles loopt. Tijd voor een uitdaging.</p>
              ) : (
                <div className="space-y-5">
                  {struggling.slice(0, 8).map((p) => (
                    <SkillBar key={p.id} name={p.skill.nameNl} value={p.proficiency} color="vermillion" />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Classes */}
          <div className="mb-20">
            <div className="flex items-end justify-between rule-b pb-5 mb-8">
              <h2 className="text-label text-muted">Jouw klassen</h2>
              <span className="text-label-mono text-muted">
                {String(student.enrollments.length).padStart(2, "0")}
              </span>
            </div>
            <div className="space-y-10">
              {student.enrollments.map((e) => (
                <div key={e.id}>
                  <h3 className="font-display text-3xl md:text-4xl leading-none mb-5">
                    {e.class.name}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {e.class.classCourses.map((cc) => (
                      <Link
                        key={cc.id}
                        href={`/student/course/${cc.course.slug}`}
                        className="group inline-flex items-center gap-2 px-4 py-2 rounded-full border border-rule-2 hover:border-honey hover:bg-honey hover:text-obsidian transition-all text-sm"
                      >
                        <span>{cc.course.titleNl}</span>
                        <ArrowUpRight
                          size={12}
                          className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Check-in CTA */}
          <div className="bg-obsidian text-paper p-10 md:p-14 rounded-lg grain relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-2xl">
                <p className="text-label text-honey mb-4">— Check-in</p>
                <h3 className="font-display text-4xl md:text-5xl leading-[0.95] mb-4">
                  Hoe gaat het <span className="italic font-light"
                    style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144' }}>écht</span>?
                </h3>
                <p className="text-paper/70 leading-relaxed max-w-lg">
                  Een korte check-in helpt je coach om je beter te begeleiden.
                  Dertig seconden.
                </p>
              </div>
              <Link
                href="/student/checkin"
                className="group inline-flex items-center gap-3 bg-honey text-paper px-7 py-4 rounded-full font-medium transition-all hover:pr-9 w-max"
              >
                <span>Check-in doen</span>
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ─── SUB ──────────────────────────────────────────── */

function DashNav({ name, role }: { name: string; role: string }) {
  return (
    <header className="sticky top-0 z-50 bg-obsidian/80 backdrop-blur-xl border-b border-rule-2">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Hex size={18} className="text-honey" filled />
          <span className="font-display text-xl tracking-tight">Dream Academy</span>
        </Link>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm text-paper font-medium">{name}</span>
            <span className="text-label text-muted">{role}</span>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-paper transition-colors"
            >
              <LogOut size={14} />
              <span className="hidden md:inline">Uitloggen</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline justify-between gap-4 rule-b pb-3">
      <span className="text-label text-muted">{label}</span>
      <span className="numerals font-display text-2xl text-paper">
        {String(value).padStart(2, "0")}
      </span>
    </div>
  );
}

function SkillBar({ name, value, color }: { name: string; value: number; color: "honey" | "vermillion" }) {
  const barColor = color === "honey" ? "#C89F4A" : "#D64526";
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-sm text-paper">{name}</span>
        <span className="numerals text-label text-muted">
          {String(value).padStart(2, "0")} / 100
        </span>
      </div>
      <div className="relative h-[2px] bg-rule-2 overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full transition-all"
          style={{ width: `${value}%`, background: barColor }}
        />
      </div>
    </div>
  );
}

function PeerHelpCard({
  id,
  name,
  reason,
  score,
  skill,
}: {
  id: string;
  name: string;
  reason: string;
  score: number;
  skill: string;
}) {
  return (
    <article className="group p-6 md:p-8 bg-obsidian-2 rounded-lg border border-rule-2 hover:border-ink/30 transition-all">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <Avatar name={name} />
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-label text-muted">Match {String(score).padStart(2, "0")}</div>
          </div>
        </div>
        <span className="text-label-mono text-muted">/ {skill}</span>
      </div>
      <p className="text-sm text-paper/80 leading-relaxed mb-6 min-h-[3rem]">{reason}</p>
      <form action={`/api/student/peer-match/${id}/contact`} method="POST">
        <button
          type="submit"
          className="group/btn w-full inline-flex items-center justify-between gap-2 px-5 py-3 bg-paper text-obsidian rounded-full text-sm font-medium hover:bg-honey transition-all"
        >
          <span className="flex items-center gap-2">
            <HandHelping size={14} />
            Contact opnemen
          </span>
          <ArrowUpRight
            size={14}
            className="transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5"
          />
        </button>
      </form>
    </article>
  );
}

function PeerGiveCard({ name, skill }: { name: string; skill: string }) {
  return (
    <article className="p-6 md:p-8 bg-obsidian-2 rounded-lg border border-rule-2 border-dashed">
      <div className="flex items-center gap-3 mb-4">
        <Avatar name={name} />
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-label text-muted">Zoekt hulp</div>
        </div>
      </div>
      <p className="text-sm text-paper/80">
        Heeft hulp nodig met{" "}
        <span className="font-mono text-honey-deep">{skill}</span>. Jij bent hierin sterk.
      </p>
    </article>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="relative w-10 h-10 shrink-0">
      <div
        className="absolute inset-0 flex items-center justify-center font-display text-lg text-paper bg-honey/25"
        style={{
          clipPath:
            "polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)",
        }}
      >
        <span>{name.charAt(0)}</span>
      </div>
    </div>
  );
}

function greetingNl(): string {
  const h = new Date().getHours();
  if (h < 6) return "Goedenacht";
  if (h < 12) return "Goedemorgen";
  if (h < 18) return "Goedemiddag";
  return "Goedenavond";
}
