import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Award,
  Clock,
  Compass,
  HandHelping,
  Lock,
  PlayCircle,
  Sparkles,
  Unlock,
} from "lucide-react";
import { db } from "@/lib/db";
import { Hex } from "@/components/Honeycomb";
import { BODIES, BODY_BY_COURSE_SLUG, JOURNEYS } from "@/components/atlas/graph";
import { PlanetHero } from "@/components/atlas/PlanetHero";

// Rendered per-request so we read live DB data.
export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return BODIES.filter((b) => !!b.courseSlug).map((b) => ({
    slug: b.courseSlug!,
  }));
}

type Params = { slug: string };

const CYAN = "#00A6D6";
const CYAN_DEEP = "#0076A4";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;

  const course = await db.course.findUnique({
    where: { slug },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          skills: { include: { skill: true } },
          assignments: { orderBy: { order: "asc" } },
        },
      },
      badges: true,
    },
  });

  if (!course) return notFound();

  const body = BODY_BY_COURSE_SLUG.get(slug);
  if (!body) return notFound();

  const prereqSlugs: string[] = safeJsonArray(course.prerequisites);
  const prereqCourses = prereqSlugs.length
    ? await db.course.findMany({
        where: { slug: { in: prereqSlugs } },
      })
    : [];
  const unlockCourses = await db.course.findMany({
    where: {
      slug: { not: course.slug },
      prerequisites: { contains: `"${course.slug}"` },
    },
  });

  const relatedJourneys = JOURNEYS.filter((j) => j.stops.includes(body.id));

  const totalHours = course.modules.reduce(
    (acc, m) => acc + (m.estimatedHours ?? 0),
    0,
  );

  const badge = course.badges.find((b) => b.tier === "BRONZE") ?? course.badges[0];

  return (
    <main className="relative min-h-screen bg-paper text-ink">
      {/* ═══ HEADER — floats over the 3D hero, dark-ready ═══════ */}
      <header className="absolute top-0 left-0 right-0 z-30 px-4 md:px-10 py-4 md:py-5 flex items-center justify-between">
        <Link
          href="/atlas"
          className="inline-flex items-center gap-2 text-sm text-paper/85 hover:text-paper transition-colors"
        >
          <ArrowLeft size={14} />
          <span className="link-editorial hidden sm:inline">Terug naar Atlas</span>
          <span className="link-editorial sm:hidden">Atlas</span>
        </Link>

        <div className="flex items-center gap-2">
          <Hex size={16} style={{ color: CYAN }} filled />
          <span className="font-display font-bold text-base md:text-lg text-paper">
            Dream Academy
          </span>
        </div>

        <Link
          href="/courses"
          className="inline-flex items-center gap-2 text-sm text-paper/85 hover:text-paper link-editorial"
        >
          <span className="hidden sm:inline">Alle cursussen</span>
          <span className="sm:hidden">Alle</span>
          <ArrowUpRight size={14} />
        </Link>
      </header>

      {/* ═══ HERO — 3D PLANET + OVERLAY (shorter on mobile) ═══ */}
      <section className="relative h-[60vh] min-h-[420px] md:h-[86vh] md:min-h-[640px] w-full overflow-hidden bg-obsidian">
        <div className="absolute inset-0">
          <PlanetHero bodyId={body.id} />
        </div>

        {/* Bottom gradient — pulls the planet down into readable text area */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(5,8,12,0) 40%, rgba(5,8,12,0.6) 75%, rgba(5,8,12,0.95) 100%)",
          }}
        />

        {/* Mobile: compact title bar pinned to bottom; Desktop: full overlay */}
        <div className="absolute bottom-6 md:bottom-16 left-4 right-4 md:left-10 md:right-10 z-10 pointer-events-none">
          <div className="mx-auto max-w-[1440px] md:grid md:grid-cols-12 md:gap-10 md:items-end">
            <div className="md:col-span-7 pointer-events-auto">
              <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-5 flex-wrap">
                <span
                  className="text-label-mono px-2 py-1 text-[10px]"
                  style={{ backgroundColor: CYAN, color: "#FFFFFF" }}
                >
                  {romanLevel(course.level)} · {levelName(course.level)}
                </span>
                <span className="text-label text-paper/80 text-[10px]">
                  {pad(course.durationWeeks)} weken
                </span>
              </div>
              <h1
                className="text-display text-paper leading-[0.92]"
                style={{ fontSize: "clamp(2.25rem, 9vw, 8rem)" }}
              >
                {course.titleNl}
                <span style={{ color: CYAN }}>.</span>
              </h1>
              {/* Subtitle + CTAs — desktop only in the overlay;
                  on mobile they live below the hero for breathing room */}
              <div className="hidden md:block">
                {course.subtitle && (
                  <p className="mt-6 text-lg md:text-xl max-w-xl text-paper/85 leading-relaxed">
                    {course.subtitle}
                  </p>
                )}
                <div className="mt-9 flex flex-wrap items-center gap-5">
                  <Link
                    href={`/auth/login?redirect=${encodeURIComponent(
                      `/student?enroll=${course.slug}`,
                    )}`}
                    className="group inline-flex items-center gap-3 bg-cyan text-paper px-7 py-4 font-semibold text-sm uppercase tracking-wider transition-all hover:bg-cyan-deep hover:pr-9"
                  >
                    <PlayCircle size={18} />
                    <span>Start het programma</span>
                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                  <Link
                    href="/atlas"
                    className="inline-flex items-center gap-2 text-sm text-paper/80 hover:text-paper"
                  >
                    <Compass size={14} />
                    <span className="link-editorial">Zie op de kaart</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Desktop meta card — hidden on mobile (rendered below the hero) */}
            <div className="hidden md:block md:col-span-4 md:col-start-9 pointer-events-auto">
              <div className="p-6 backdrop-blur-md bg-obsidian/70 border border-white/15">
                <MetaRowDark label="Niveau" value={`${romanLevel(course.level)} · ${levelName(course.level)}`} />
                <MetaRowDark label="Duur" value={`${pad(course.durationWeeks)} weken`} />
                <MetaRowDark label="Modules" value={pad(course.modules.length)} />
                {totalHours > 0 && (
                  <MetaRowDark label="Studielast" value={`±${totalHours} uur`} />
                )}
                {badge && (
                  <MetaRowDark
                    label="Badge"
                    value={
                      badge.tier === "GOLD"
                        ? "Goud"
                        : badge.tier === "SILVER"
                          ? "Zilver"
                          : "Brons"
                    }
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ MOBILE subtitle + CTAs — rendered in document flow below the hero */}
      <section className="md:hidden px-4 pt-6 pb-2 bg-paper">
        {course.subtitle && (
          <p className="text-base leading-relaxed text-muted mb-6">
            {course.subtitle}
          </p>
        )}
        <Link
          href={`/auth/login?redirect=${encodeURIComponent(
            `/student?enroll=${course.slug}`,
          )}`}
          className="group flex items-center justify-center gap-3 bg-cyan text-paper px-6 py-4 font-semibold text-sm uppercase tracking-wider transition-all hover:bg-cyan-deep"
        >
          <PlayCircle size={18} />
          <span>Start het programma</span>
          <ArrowRight size={18} />
        </Link>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link
            href="/atlas"
            className="inline-flex items-center justify-center gap-2 py-3 border border-rule-2 text-sm text-ink"
          >
            <Compass size={14} />
            Kaart
          </Link>
          <Link
            href="/courses"
            className="inline-flex items-center justify-center gap-2 py-3 border border-rule-2 text-sm text-ink"
          >
            Alle cursussen
          </Link>
        </div>

        {/* Mobile meta card — bg-paper-2 block below CTAs */}
        <div className="mt-6 p-5 bg-paper-2">
          <MetaRowLight label="Niveau" value={`${romanLevel(course.level)} · ${levelName(course.level)}`} />
          <MetaRowLight label="Duur" value={`${pad(course.durationWeeks)} weken`} />
          <MetaRowLight label="Modules" value={pad(course.modules.length)} />
          {totalHours > 0 && (
            <MetaRowLight label="Studielast" value={`±${totalHours} uur`} />
          )}
          {badge && (
            <MetaRowLight
              label="Badge"
              value={
                badge.tier === "GOLD"
                  ? "Goud"
                  : badge.tier === "SILVER"
                    ? "Zilver"
                    : "Brons"
              }
            />
          )}
        </div>
      </section>

      {/* ═══ OVERVIEW — light, institutional ══════════════════════ */}
      <section className="px-6 md:px-10 py-20 md:py-28 bg-paper">
        <div className="mx-auto max-w-[1440px]">
          <SectionHead index="01" label="Overzicht" />

          <div className="grid grid-cols-12 gap-6 md:gap-10">
            <div className="col-span-12 lg:col-span-7">
              <p
                className="font-display font-light leading-[1.1] mb-8 text-ink-2"
                style={{ fontSize: "clamp(1.4rem, 2.6vw, 2.25rem)" }}
              >
                {course.description}
              </p>
              {course.capstoneBrief && (
                <div className="p-6 border-l-4 border-cyan bg-cyan-soft">
                  <p className="text-label text-cyan-deep mb-3 inline-flex items-center gap-2">
                    <Award size={12} /> Capstone
                  </p>
                  <p className="font-serif italic text-lg leading-snug text-ink-2"
                    style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144' }}>
                    &ldquo;{course.capstoneBrief}&rdquo;
                  </p>
                </div>
              )}
            </div>

            <div className="col-span-12 lg:col-span-4 lg:col-start-9">
              <div className="pl-6 border-l border-rule-2 space-y-6">
                <StatRow
                  icon={<Clock size={14} />}
                  label="Doorlooptijd"
                  value={`${course.durationWeeks} weken`}
                />
                <StatRow
                  icon={<Sparkles size={14} />}
                  label="AI-ondersteuning"
                  value="Live feedback"
                />
                <StatRow
                  icon={<HandHelping size={14} />}
                  label="Peer matching"
                  value="Automatisch gekoppeld"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ MODULES ═════════════════════════════════════════════ */}
      {course.modules.length > 0 && (
        <section className="px-6 md:px-10 py-20 md:py-28 bg-paper-2">
          <div className="mx-auto max-w-[1440px]">
            <SectionHead
              index="02"
              label="De route"
              title={`${pad(course.modules.length)} modules.`}
            />

            <ol className="space-y-4">
              {course.modules.map((m, i) => {
                const uniqueSkills = Array.from(
                  new Map(m.skills.map((ms) => [ms.skill.slug, ms.skill])).values(),
                );
                const isCapstone = m.assignments.some((a) => a.isCapstone);
                return (
                  <li key={m.id}>
                    <article
                      className={`grid grid-cols-12 gap-4 md:gap-8 p-6 md:p-8 bg-paper border transition-colors ${
                        isCapstone ? "border-cyan" : "border-rule-2"
                      }`}
                    >
                      <div className="col-span-12 md:col-span-2 flex md:flex-col md:items-start items-center md:gap-3 gap-5">
                        <span
                          className="numerals font-display font-bold text-5xl md:text-6xl leading-none text-cyan"
                        >
                          {pad(i + 1)}
                        </span>
                        {isCapstone && (
                          <span className="text-label-mono px-2 py-1 bg-cyan text-paper">
                            Capstone
                          </span>
                        )}
                      </div>
                      <div className="col-span-12 md:col-span-7">
                        <h3 className="font-display font-bold text-2xl md:text-3xl mb-2 text-ink-2">
                          {m.titleNl}
                        </h3>
                        <p className="text-sm leading-relaxed text-muted">
                          {m.description}
                        </p>
                      </div>
                      <div className="col-span-12 md:col-span-3 flex flex-col gap-3 md:items-end">
                        <div className="text-label-mono text-xs text-muted">
                          ±{m.estimatedHours}u
                        </div>
                        {uniqueSkills.length > 0 && (
                          <div className="flex flex-wrap md:justify-end gap-1.5">
                            {uniqueSkills.map((s) => (
                              <span
                                key={s.slug}
                                className="text-[10px] px-2 py-1 bg-paper-2 border border-rule-2 text-ink-2"
                              >
                                {s.nameNl}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      )}

      {/* ═══ PROGRESSION ═════════════════════════════════════════ */}
      {(prereqCourses.length > 0 || unlockCourses.length > 0) && (
        <section className="px-6 md:px-10 py-20 md:py-28 bg-paper">
          <div className="mx-auto max-w-[1440px]">
            <SectionHead
              index="03"
              label="Positie in de baan"
              title="Voor en na."
            />

            <div className="grid grid-cols-12 gap-6 md:gap-10">
              <div className="col-span-12 md:col-span-6">
                <p className="text-label text-muted mb-5 inline-flex items-center gap-2">
                  <Lock size={12} /> Voorkennis
                </p>
                {prereqCourses.length === 0 ? (
                  <p className="font-serif italic text-xl text-muted"
                    style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144' }}>
                    Geen voorkennis nodig — deze planeet staat aan de start.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {prereqCourses.map((p) => (
                      <CourseChip
                        key={p.slug}
                        title={p.titleNl}
                        subtitle={p.subtitle}
                        slug={p.slug}
                      />
                    ))}
                  </ul>
                )}
              </div>

              <div className="col-span-12 md:col-span-6">
                <p className="text-label text-cyan mb-5 inline-flex items-center gap-2">
                  <Unlock size={12} /> Ontgrendelt
                </p>
                {unlockCourses.length === 0 ? (
                  <p className="font-serif italic text-xl text-muted"
                    style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144' }}>
                    Eindstation — De Meester.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {unlockCourses.map((u) => (
                      <CourseChip
                        key={u.slug}
                        title={u.titleNl}
                        subtitle={u.subtitle}
                        slug={u.slug}
                        highlight
                      />
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══ JOURNEYS ════════════════════════════════════════════ */}
      {relatedJourneys.length > 0 && (
        <section className="px-6 md:px-10 py-20 md:py-28 bg-paper-2">
          <div className="mx-auto max-w-[1440px]">
            <SectionHead
              index="04"
              label="Reizen die hier langskomen"
              title={`${pad(relatedJourneys.length)} pad${relatedJourneys.length === 1 ? "" : "en"}.`}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {relatedJourneys.map((j) => (
                <Link
                  key={j.id}
                  href="/atlas"
                  className="group p-7 bg-paper border border-rule-2 transition-all hover:border-cyan hover:-translate-y-1 duration-300"
                >
                  <div className="flex items-center gap-2 mb-4 text-cyan">
                    <Compass size={14} />
                    <span className="text-label">{j.subtitle}</span>
                  </div>
                  <h3 className="font-display font-bold text-2xl md:text-3xl mb-5 leading-tight text-ink-2">
                    {j.title}
                  </h3>
                  <p className="text-sm leading-relaxed mb-6 text-muted">
                    {j.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {j.stops.map((stopId, idx) => {
                      const stop = BODIES.find((b) => b.id === stopId);
                      const isThis = stopId === body.id;
                      return (
                        <span
                          key={stopId}
                          className="inline-flex items-center gap-1.5 text-xs"
                        >
                          <span
                            className={`px-2 py-1 ${
                              isThis
                                ? "bg-cyan text-paper font-semibold"
                                : "bg-paper-2 text-ink-2 border border-rule-2"
                            }`}
                          >
                            {stop?.label ?? stopId}
                          </span>
                          {idx < j.stops.length - 1 && (
                            <ArrowRight
                              size={10}
                              className="text-muted"
                            />
                          )}
                        </span>
                      );
                    })}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ FINAL CTA ═══════════════════════════════════════════ */}
      <section className="px-6 md:px-10 py-24 md:py-36 bg-paper">
        <div className="mx-auto max-w-[1100px] text-center">
          <Hex
            size={22}
            style={{ color: CYAN, margin: "0 auto 1.5rem" }}
            filled
          />
          <h2
            className="font-display text-ink-2 leading-[0.95] mb-8"
            style={{ fontSize: "clamp(2.75rem, 6.5vw, 5.5rem)" }}
          >
            Klaar om te <span className="text-cyan">beginnen</span>?
          </h2>
          <p className="text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed text-muted">
            Eén klik schrijft je in voor {course.titleNl}. Je komt terecht in je
            eigen werkplek met je eerste check-in klaar.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link
              href={`/auth/login?redirect=${encodeURIComponent(
                `/student?enroll=${course.slug}`,
              )}`}
              className="group inline-flex items-center gap-3 bg-cyan text-paper px-7 py-4 font-semibold text-sm uppercase tracking-wider transition-all hover:bg-cyan-deep hover:pr-9"
            >
              <PlayCircle size={18} />
              <span>Start het programma</span>
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="/courses"
              className="link-cyan text-sm font-medium"
            >
              Verken andere planeten
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ─── SMALL PIECES ─────────────────────────────────── */

function SectionHead({
  index,
  label,
  title,
}: {
  index: string;
  label: string;
  title?: string;
}) {
  return (
    <div className="flex items-end justify-between rule-b pb-5 mb-12">
      <div>
        <p className="text-label text-cyan mb-2">{label}</p>
        {title && (
          <h2 className="font-display font-bold text-3xl md:text-4xl text-ink-2">
            {title}
          </h2>
        )}
      </div>
      <span className="text-label-mono text-muted">§ {index}</span>
    </div>
  );
}

function MetaRowDark({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between py-2.5 border-b border-white/10 last:border-b-0">
      <span className="text-label text-paper/70">{label}</span>
      <span className="font-display font-semibold text-sm text-paper">
        {value}
      </span>
    </div>
  );
}

function MetaRowLight({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between py-2.5 border-b border-rule last:border-b-0">
      <span className="text-label text-muted">{label}</span>
      <span className="font-display font-semibold text-sm text-ink-2">
        {value}
      </span>
    </div>
  );
}

function StatRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="inline-flex items-center justify-center w-9 h-9 shrink-0 bg-cyan text-paper">
        {icon}
      </span>
      <div>
        <p className="text-label text-muted mb-1">{label}</p>
        <p className="font-display font-semibold text-base text-ink-2">{value}</p>
      </div>
    </div>
  );
}

function CourseChip({
  title,
  subtitle,
  slug,
  highlight,
}: {
  title: string;
  subtitle: string | null;
  slug: string;
  highlight?: boolean;
}) {
  return (
    <li>
      <Link
        href={`/courses/${slug}`}
        className={`group flex items-center gap-4 p-4 transition-all ${
          highlight
            ? "bg-cyan-soft border border-cyan hover:bg-cyan hover:text-paper"
            : "bg-paper border border-rule-2 hover:border-ink"
        }`}
      >
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{
            backgroundColor: highlight ? CYAN_DEEP : "#9E9E9E",
          }}
        />
        <div className="flex-1 min-w-0">
          <p className="font-display font-semibold text-lg leading-tight">
            {title}
          </p>
          {subtitle && (
            <p className={`text-xs mt-1 truncate ${highlight ? "opacity-80 group-hover:text-paper" : "text-muted"}`}>
              {subtitle}
            </p>
          )}
        </div>
        <ArrowRight
          size={14}
          className="transition-transform group-hover:translate-x-1 opacity-60"
        />
      </Link>
    </li>
  );
}

/* ─── HELPERS ──────────────────────────────────────── */

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function romanLevel(n: number): string {
  return ["", "I", "II", "III", "IV"][n] ?? String(n);
}

function levelName(lvl: number): string {
  return (
    ["", "Instap", "Vaardigheden", "Meesterschap", "Integratie"][lvl] ?? ""
  );
}

function safeJsonArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value as string[];
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
