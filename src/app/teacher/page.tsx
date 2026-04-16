import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

import { Sparkles, ArrowUpRight, LogOut, AlertCircle, Star, TrendingUp, Users as UsersIcon, HandHelping } from "lucide-react";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Hex } from "@/components/Honeycomb";

export default async function TeacherDashboard() {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") redirect("/auth/login");

  const teacher = await db.user.findUnique({
    where: { id: session.userId },
    include: {
      teachingClasses: {
        include: {
          enrollments: {
            where: { status: "ACTIVE" },
            include: { student: true },
          },
          insights: {
            where: { dismissedAt: null },
            orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
            take: 10,
            include: { student: true },
          },
          classCourses: { include: { course: true } },
        },
      },
    },
  });

  if (!teacher) redirect("/auth/login");

  return (
    <main className="min-h-screen">
      <DashNav name={teacher.name} role="Docent" />

      <section className="px-6 md:px-10 py-12 md:py-16">
        <div className="mx-auto max-w-[1440px]">
          {/* Header */}
          <div className="flex items-center justify-between rule-b pb-5 mb-12">
            <div className="flex items-center gap-4 text-label text-muted">
              <span className="numerals">
                {new Date().toLocaleDateString("nl-NL", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
              <Hex size={10} className="text-honey" filled />
              <span>Docent dashboard</span>
            </div>
            <span className="text-label-mono text-muted hidden md:block">
              {teacher.teachingClasses.length} klas{teacher.teachingClasses.length === 1 ? "" : "sen"}
            </span>
          </div>

          {/* Hero greeting */}
          <div className="grid grid-cols-12 gap-6 md:gap-10 mb-16 md:mb-20">
            <div className="col-span-12 lg:col-span-8">
              <p className="text-label text-honey-deep mb-6">— {greetingNl()}</p>
              <h1
                className="text-display text-paper"
                style={{ fontSize: "clamp(2.5rem, 6vw, 5.5rem)" }}
              >
                {teacher.name.split(" ")[0]}
                <span className="text-honey">.</span>
              </h1>
            </div>
            <div className="col-span-12 lg:col-span-4 lg:pl-10 lg:border-l lg:border-rule-2 lg:self-end">
              <p className="text-paper/80 leading-relaxed">
                De co-teacher heeft je klas meegelezen. Hieronder wat ik zag,
                en wie vandaag aandacht verdient.
              </p>
            </div>
          </div>

          {teacher.teachingClasses.length === 0 && (
            <div className="rule-y py-20 text-center">
              <p className="text-muted">Nog geen klassen aan je gekoppeld.</p>
            </div>
          )}

          {/* Classes */}
          {teacher.teachingClasses.map((klass) => (
            <div key={klass.id} className="mb-20 md:mb-24">
              <div className="flex flex-col md:flex-row md:items-end justify-between rule-b pb-5 mb-10 gap-4">
                <div>
                  <p className="text-label text-muted mb-2">Klas</p>
                  <h2 className="font-display text-4xl md:text-5xl leading-[1]">{klass.name}</h2>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="numerals text-2xl font-display">
                      {String(klass.enrollments.length).padStart(2, "0")}
                    </div>
                    <div className="text-label text-muted">Studenten</div>
                  </div>
                  <div className="text-right">
                    <div className="numerals text-2xl font-display">
                      {String(klass.classCourses.length).padStart(2, "0")}
                    </div>
                    <div className="text-label text-muted">Cursussen</div>
                  </div>
                  <form action={`/api/teacher/generate-insights?classId=${klass.id}`} method="POST">
                    <button
                      type="submit"
                      className="group inline-flex items-center gap-2 bg-paper text-obsidian px-5 py-3 rounded-full text-sm font-medium hover:bg-honey transition-all hover:pr-6"
                    >
                      <Sparkles size={14} />
                      <span>Co-teacher activeren</span>
                    </button>
                  </form>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-6 md:gap-10">
                {/* Insights column */}
                <div className="col-span-12 lg:col-span-7">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-label text-muted">AI Inzichten</h3>
                    <span className="text-label-mono text-muted">
                      {String(klass.insights.length).padStart(2, "0")}
                    </span>
                  </div>
                  {klass.insights.length === 0 ? (
                    <div className="rule-y py-16 text-center">
                      <Sparkles size={24} className="mx-auto text-muted-2 mb-4" strokeWidth={1} />
                      <p className="text-muted text-sm max-w-xs mx-auto">
                        Nog geen inzichten. Activeer de co-teacher voor een analyse van deze klas.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {klass.insights.map((i) => (
                        <InsightCard
                          key={i.id}
                          title={i.title}
                          body={i.body}
                          priority={i.priority}
                          type={i.type}
                          studentName={i.student?.name ?? null}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Students column */}
                <div className="col-span-12 lg:col-span-5 lg:pl-10 lg:border-l lg:border-rule-2">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-label text-muted">Studenten</h3>
                    <span className="text-label-mono text-muted">
                      {String(klass.enrollments.length).padStart(2, "0")}
                    </span>
                  </div>
                  <ul className="divide-y divide-rule-2">
                    {klass.enrollments.map((e) => (
                      <li key={e.id}>
                        <Link
                          href={`/teacher/student/${e.student.id}`}
                          className="group flex items-center gap-4 py-4 -mx-2 px-2 rounded hover:bg-obsidian-2 transition-colors"
                        >
                          <Avatar name={e.student.name} />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-paper truncate">{e.student.name}</div>
                            <div className="text-xs text-muted numerals">
                              {lastSeenText(e.student.lastSeenAt)}
                            </div>
                          </div>
                          <ArrowUpRight
                            size={14}
                            className="text-muted group-hover:text-paper group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

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

function Avatar({ name }: { name: string }) {
  const initial = name.charAt(0);
  return (
    <div className="relative w-10 h-10 shrink-0">
      <div className="absolute inset-0 bg-obsidian-2 rounded-full" />
      <div
        className="absolute inset-0 flex items-center justify-center font-display text-lg text-paper"
        style={{
          clipPath:
            "polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)",
        }}
      >
        <div className="absolute inset-0 bg-honey/20" />
        <span className="relative">{initial}</span>
      </div>
    </div>
  );
}

function InsightCard({
  title,
  body,
  priority,
  type,
  studentName,
}: {
  title: string;
  body: string;
  priority: string;
  type: string;
  studentName: string | null;
}) {
  const priorityColor = {
    URGENT: "var(--color-vermillion)",
    HIGH: "var(--color-terracotta)",
    MEDIUM: "var(--color-honey)",
    LOW: "var(--color-muted-2)",
  }[priority] ?? "var(--color-muted-2)";

  const typeIcon = {
    stuck: AlertCircle,
    excelling: Star,
    pattern: TrendingUp,
    intervention: AlertCircle,
    pair: HandHelping,
  }[type] ?? Sparkles;

  const Icon = typeIcon;

  return (
    <article className="group relative pl-8 pr-4 py-6 bg-obsidian-2 rounded-lg border border-rule-2 hover:border-ink/30 transition-all">
      <span
        className="absolute left-4 top-0 bottom-0 w-0.5"
        style={{ background: priorityColor }}
      />
      <div className="flex items-start gap-4">
        <span
          className="inline-flex items-center justify-center w-9 h-9 rounded-full shrink-0"
          style={{ background: priorityColor, color: "#FAF7F2" }}
        >
          <Icon size={15} strokeWidth={1.8} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h4 className="font-display text-xl leading-tight">{title}</h4>
            {studentName && (
              <span className="text-label px-2 py-0.5 bg-paper border border-rule-2 rounded-full text-muted">
                {studentName}
              </span>
            )}
          </div>
          <p className="text-paper/80 leading-relaxed">{body}</p>
          <div className="mt-4 flex items-center gap-4 text-label-mono text-muted">
            <span>{priority}</span>
            <span>·</span>
            <span>{type}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function lastSeenText(date: Date): string {
  const hours = Math.floor((Date.now() - new Date(date).getTime()) / 3600000);
  if (hours < 1) return "net online";
  if (hours < 24) return `${hours}u geleden`;
  const days = Math.floor(hours / 24);
  return `${days}d geleden`;
}

function greetingNl(): string {
  const h = new Date().getHours();
  if (h < 6) return "Goedenacht";
  if (h < 12) return "Goedemorgen";
  if (h < 18) return "Goedemiddag";
  return "Goedenavond";
}
