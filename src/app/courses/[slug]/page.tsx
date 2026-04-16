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

// Rendered per-request so we read live DB data (progress, enrollment).
// generateStaticParams would still prerender at build, but that requires
// a reachable DATABASE_URL at build time — force-dynamic avoids that.
export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  // Keep derived slugs available for fallback — the graph doesn't touch the DB.
  return BODIES.filter((b) => !!b.courseSlug).map((b) => ({
    slug: b.courseSlug!,
  }));
}

type Params = { slug: string };

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

  // Prereq + unlock course data — hydrate from DB for titles
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

  // Find journeys that include this planet
  const relatedJourneys = JOURNEYS.filter((j) => j.stops.includes(body.id));

  const totalHours = course.modules.reduce(
    (acc, m) => acc + (m.estimatedHours ?? 0),
    0,
  );

  const badge = course.badges.find((b) => b.tier === "BRONZE") ?? course.badges[0];

  const accent = course.colorHex ?? body.color;
  const glow = body.glowColor ?? accent;

  return (
    <main
      className="relative min-h-screen"
      style={{ backgroundColor: "#120C07", color: "#F5F0E6" }}
    >
      {/* ═══ HEADER ══════════════════════════════════════ */}
      <header className="absolute top-0 left-0 right-0 z-30 px-6 md:px-10 py-6 flex items-center justify-between">
        <Link
          href="/atlas"
          className="inline-flex items-center gap-2 text-sm transition-opacity"
          style={{ color: "#F5F0E6", opacity: 0.85 }}
        >
          <ArrowLeft size={14} />
          <span className="link-editorial">Terug naar Atlas</span>
        </Link>

        <div className="flex items-center gap-2">
          <Hex size={18} style={{ color: glow }} filled />
          <span className="font-display text-xl" style={{ color: "#F5F0E6" }}>
            Dream Academy
          </span>
        </div>

        <Link
          href="/courses"
          className="inline-flex items-center gap-2 text-sm link-editorial"
          style={{ color: "#F5F0E6", opacity: 0.85 }}
        >
          Alle cursussen
          <ArrowUpRight size={14} />
        </Link>
      </header>

      {/* ═══ HERO — 3D PLANET + OVERLAY ════════════════════ */}
      <section className="relative h-[86vh] min-h-[640px] w-full overflow-hidden">
        <div className="absolute inset-0">
          <PlanetHero bodyId={body.id} />
        </div>

        {/* Top gradient for legibility */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(10,6,4,0) 40%, rgba(10,6,4,0.55) 75%, rgba(10,6,4,0.85) 100%)",
          }}
        />

        {/* Bottom-left: title + meta */}
        <div className="absolute bottom-10 md:bottom-16 left-6 md:left-10 right-6 md:right-10 z-10 pointer-events-none">
          <div className="mx-auto max-w-[1440px] grid grid-cols-12 gap-6 md:gap-10 items-end">
            <div className="col-span-12 lg:col-span-7 pointer-events-auto">
              <div className="flex items-center gap-3 mb-5 text-label"
                style={{ color: glow }}>
                <span
                  className="inline-flex items-center justify-center px-2 py-0.5 rounded font-mono text-[10px]"
                  style={{
                    background: "#1A1611",
                    color: glow,
                    letterSpacing: "0.08em",
                  }}
                >
                  {romanLevel(course.level)} · {levelName(course.level)}
                </span>
                <span className="opacity-80">{course.titleNl}</span>
              </div>
              <h1
                className="text-display leading-[0.92]"
                style={{
                  fontSize: "clamp(3rem, 9vw, 8rem)",
                  color: "#F5F0E6",
                }}
              >
                {course.titleNl.split(" ").slice(0, -1).join(" ")}{" "}
                <span
                  className="italic font-light"
                  style={{
                    color: glow,
                    fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144',
                  }}
                >
                  {course.titleNl.split(" ").slice(-1)}
                </span>
                <span style={{ color: glow }}>.</span>
              </h1>
              {course.subtitle && (
                <p className="mt-6 text-lg md:text-xl max-w-xl leading-relaxed"
                  style={{ color: "#F5F0E6", opacity: 0.86 }}>
                  {course.subtitle}
                </p>
              )}

              <div className="mt-9 flex flex-wrap items-center gap-5">
                <Link
                  href={`/auth/login?redirect=${encodeURIComponent(
                    `/student?enroll=${course.slug}`,
                  )}`}
                  className="group inline-flex items-center gap-3 px-7 py-4 rounded-full font-medium transition-all hover:pr-9"
                  style={{
                    backgroundColor: glow,
                    color: "#1A1611",
                  }}
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
                  className="inline-flex items-center gap-2 text-sm"
                  style={{ color: "#F5F0E6", opacity: 0.78 }}
                >
                  <Compass size={14} />
                  <span className="link-editorial">Zie op de kaart</span>
                </Link>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 lg:col-start-9 pointer-events-auto">
              <div
                className="p-6 rounded-xl backdrop-blur-md"
                style={{
                  backgroundColor: "rgba(10, 7, 4, 0.55)",
                  border: "1px solid rgba(245, 240, 230, 0.12)",
                }}
              >
                <MetaRow label="Niveau" value={`${romanLevel(course.level)} · ${levelName(course.level)}`} />
                <MetaRow label="Duur" value={`${pad(course.durationWeeks)} weken`} />
                <MetaRow label="Modules" value={pad(course.modules.length)} />
                {totalHours > 0 && (
                  <MetaRow label="Studielast" value={`±${totalHours} uur`} />
                )}
                {badge && (
                  <MetaRow
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

      {/* ═══ OVERVIEW ════════════════════════════════════ */}
      <section
        className="px-6 md:px-10 py-20 md:py-28 relative"
        style={{
          borderTop: "1px solid rgba(245, 240, 230, 0.08)",
        }}
      >
        <div className="mx-auto max-w-[1440px]">
          <div className="flex items-center justify-between mb-10"
            style={{ borderBottom: "1px solid rgba(245, 240, 230, 0.1)", paddingBottom: "1.25rem" }}>
            <p className="text-label" style={{ color: glow }}>
              — Overzicht
            </p>
            <span className="text-label-mono" style={{ color: "#F5F0E6", opacity: 0.5 }}>
              § 01
            </span>
          </div>

          <div className="grid grid-cols-12 gap-6 md:gap-10">
            <div className="col-span-12 lg:col-span-7">
              <p
                className="font-display leading-[1.08] mb-8"
                style={{
                  fontSize: "clamp(1.4rem, 2.6vw, 2.25rem)",
                  color: "#F5F0E6",
                }}
              >
                {course.description}
              </p>
              {course.capstoneBrief && (
                <div
                  className="p-6 rounded-lg"
                  style={{
                    backgroundColor: "rgba(228, 184, 102, 0.08)",
                    border: "1px solid rgba(228, 184, 102, 0.2)",
                  }}
                >
                  <p className="text-label mb-3 inline-flex items-center gap-2"
                    style={{ color: glow }}>
                    <Award size={12} /> Capstone
                  </p>
                  <p className="font-display italic text-lg leading-snug"
                    style={{
                      color: "#F5F0E6",
                      fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144',
                    }}>
                    &ldquo;{course.capstoneBrief}&rdquo;
                  </p>
                </div>
              )}
            </div>

            <div className="col-span-12 lg:col-span-4 lg:col-start-9">
              <div
                className="pl-6 space-y-6"
                style={{ borderLeft: "1px solid rgba(245, 240, 230, 0.15)" }}
              >
                <StatRow
                  icon={<Clock size={14} />}
                  label="Doorlooptijd"
                  value={`${course.durationWeeks} weken`}
                  glow={glow}
                />
                <StatRow
                  icon={<Sparkles size={14} />}
                  label="AI-ondersteuning"
                  value="Live feedback"
                  glow={glow}
                />
                <StatRow
                  icon={<HandHelping size={14} />}
                  label="Peer matching"
                  value="Automatisch gekoppeld"
                  glow={glow}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ MODULES ═════════════════════════════════════ */}
      {course.modules.length > 0 && (
        <section
          className="px-6 md:px-10 py-20 md:py-28"
          style={{
            backgroundColor: "rgba(10, 7, 4, 0.4)",
            borderTop: "1px solid rgba(245, 240, 230, 0.08)",
            borderBottom: "1px solid rgba(245, 240, 230, 0.08)",
          }}
        >
          <div className="mx-auto max-w-[1440px]">
            <div
              className="flex items-end justify-between mb-12"
              style={{ borderBottom: "1px solid rgba(245, 240, 230, 0.1)", paddingBottom: "1.25rem" }}
            >
              <div>
                <p className="text-label mb-2" style={{ color: glow }}>
                  — De route
                </p>
                <h2 className="font-display text-4xl md:text-5xl" style={{ color: "#F5F0E6" }}>
                  {pad(course.modules.length)} modules
                </h2>
              </div>
              <span className="text-label-mono" style={{ color: "#F5F0E6", opacity: 0.5 }}>
                § 02
              </span>
            </div>

            <ol className="space-y-5">
              {course.modules.map((m, i) => {
                const uniqueSkills = Array.from(
                  new Map(m.skills.map((ms) => [ms.skill.slug, ms.skill])).values(),
                );
                const isCapstone = m.assignments.some((a) => a.isCapstone);
                return (
                  <li key={m.id}>
                    <article
                      className="grid grid-cols-12 gap-4 md:gap-8 p-6 md:p-8 rounded-xl transition-colors"
                      style={{
                        backgroundColor: "rgba(245, 240, 230, 0.03)",
                        border: `1px solid ${
                          isCapstone
                            ? "rgba(228, 184, 102, 0.35)"
                            : "rgba(245, 240, 230, 0.08)"
                        }`,
                      }}
                    >
                      <div className="col-span-12 md:col-span-2 flex md:flex-col md:items-start items-center md:gap-3 gap-5">
                        <span
                          className="numerals font-display text-5xl md:text-6xl leading-none"
                          style={{ color: glow }}
                        >
                          {pad(i + 1)}
                        </span>
                        {isCapstone && (
                          <span
                            className="text-label-mono px-2 py-0.5 rounded-full text-[10px]"
                            style={{
                              color: "#1A1611",
                              backgroundColor: glow,
                              letterSpacing: "0.1em",
                            }}
                          >
                            Capstone
                          </span>
                        )}
                      </div>
                      <div className="col-span-12 md:col-span-7">
                        <h3 className="font-display text-2xl md:text-3xl mb-2" style={{ color: "#F5F0E6" }}>
                          {m.titleNl}
                        </h3>
                        <p
                          className="text-sm leading-relaxed"
                          style={{ color: "#F5F0E6", opacity: 0.72 }}
                        >
                          {m.description}
                        </p>
                      </div>
                      <div className="col-span-12 md:col-span-3 flex flex-col gap-3 md:items-end">
                        <div
                          className="text-label-mono text-xs"
                          style={{ color: "#F5F0E6", opacity: 0.55 }}
                        >
                          ±{m.estimatedHours}u
                        </div>
                        {uniqueSkills.length > 0 && (
                          <div className="flex flex-wrap md:justify-end gap-1.5">
                            {uniqueSkills.map((s) => (
                              <span
                                key={s.slug}
                                className="text-[10px] px-2 py-1 rounded-full"
                                style={{
                                  color: "#F5F0E6",
                                  backgroundColor: "rgba(245, 240, 230, 0.06)",
                                  border: "1px solid rgba(245, 240, 230, 0.12)",
                                }}
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

      {/* ═══ PROGRESSION ═════════════════════════════════ */}
      {(prereqCourses.length > 0 || unlockCourses.length > 0) && (
        <section className="px-6 md:px-10 py-20 md:py-28">
          <div className="mx-auto max-w-[1440px]">
            <div
              className="flex items-end justify-between mb-12"
              style={{ borderBottom: "1px solid rgba(245, 240, 230, 0.1)", paddingBottom: "1.25rem" }}
            >
              <div>
                <p className="text-label mb-2" style={{ color: glow }}>
                  — Positie in de baan
                </p>
                <h2 className="font-display text-4xl md:text-5xl" style={{ color: "#F5F0E6" }}>
                  Voor en na.
                </h2>
              </div>
              <span className="text-label-mono" style={{ color: "#F5F0E6", opacity: 0.5 }}>
                § 03
              </span>
            </div>

            <div className="grid grid-cols-12 gap-6 md:gap-10">
              <div className="col-span-12 md:col-span-6">
                <p className="text-label mb-5 inline-flex items-center gap-2"
                  style={{ color: "#F5F0E6", opacity: 0.7 }}>
                  <Lock size={12} /> Voorkennis
                </p>
                {prereqCourses.length === 0 ? (
                  <p
                    className="font-display italic text-xl"
                    style={{
                      color: "#F5F0E6",
                      opacity: 0.55,
                      fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144',
                    }}
                  >
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
                        color={p.colorHex ?? "#F5F0E6"}
                      />
                    ))}
                  </ul>
                )}
              </div>

              <div className="col-span-12 md:col-span-6">
                <p className="text-label mb-5 inline-flex items-center gap-2" style={{ color: glow }}>
                  <Unlock size={12} /> Ontgrendelt
                </p>
                {unlockCourses.length === 0 ? (
                  <p
                    className="font-display italic text-xl"
                    style={{
                      color: "#F5F0E6",
                      opacity: 0.55,
                      fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144',
                    }}
                  >
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
                        color={u.colorHex ?? glow}
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

      {/* ═══ JOURNEYS ════════════════════════════════════ */}
      {relatedJourneys.length > 0 && (
        <section
          className="px-6 md:px-10 py-20 md:py-28"
          style={{
            backgroundColor: "rgba(10, 7, 4, 0.4)",
            borderTop: "1px solid rgba(245, 240, 230, 0.08)",
          }}
        >
          <div className="mx-auto max-w-[1440px]">
            <div
              className="flex items-end justify-between mb-12"
              style={{ borderBottom: "1px solid rgba(245, 240, 230, 0.1)", paddingBottom: "1.25rem" }}
            >
              <div>
                <p className="text-label mb-2" style={{ color: glow }}>
                  — Reizen die hier langskomen
                </p>
                <h2 className="font-display text-4xl md:text-5xl" style={{ color: "#F5F0E6" }}>
                  {pad(relatedJourneys.length)} pad{relatedJourneys.length === 1 ? "" : "en"}.
                </h2>
              </div>
              <span className="text-label-mono" style={{ color: "#F5F0E6", opacity: 0.5 }}>
                § 04
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {relatedJourneys.map((j) => (
                <Link
                  key={j.id}
                  href="/atlas"
                  className="group p-6 md:p-7 rounded-xl transition-all"
                  style={{
                    backgroundColor: "rgba(245, 240, 230, 0.04)",
                    border: "1px solid rgba(245, 240, 230, 0.08)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-4" style={{ color: glow }}>
                    <Compass size={14} />
                    <span className="text-label">{j.subtitle}</span>
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl mb-5 leading-tight"
                    style={{ color: "#F5F0E6" }}>
                    {j.title}
                  </h3>
                  <p className="text-sm leading-relaxed mb-6"
                    style={{ color: "#F5F0E6", opacity: 0.7 }}>
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
                            className="px-2 py-1 rounded-full"
                            style={{
                              color: isThis ? "#1A1611" : "#F5F0E6",
                              backgroundColor: isThis
                                ? glow
                                : "rgba(245, 240, 230, 0.06)",
                              border: isThis
                                ? "none"
                                : "1px solid rgba(245, 240, 230, 0.12)",
                              fontWeight: isThis ? 600 : 400,
                            }}
                          >
                            {stop?.label ?? stopId}
                          </span>
                          {idx < j.stops.length - 1 && (
                            <ArrowRight
                              size={10}
                              style={{ color: "#F5F0E6", opacity: 0.4 }}
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

      {/* ═══ FINAL CTA ═══════════════════════════════════ */}
      <section className="px-6 md:px-10 py-24 md:py-36">
        <div className="mx-auto max-w-[1100px] text-center">
          <Hex
            size={22}
            style={{ color: glow, margin: "0 auto 1.5rem" }}
            filled
          />
          <h2
            className="font-display leading-[0.95] mb-8"
            style={{
              fontSize: "clamp(3rem, 7vw, 6rem)",
              color: "#F5F0E6",
            }}
          >
            Klaar om te{" "}
            <span
              className="italic font-light"
              style={{
                color: glow,
                fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144',
              }}
            >
              beginnen
            </span>
            ?
          </h2>
          <p
            className="text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed"
            style={{ color: "#F5F0E6", opacity: 0.78 }}
          >
            Eén klik schrijft je in voor {course.titleNl}. Je komt terecht in je
            eigen werkplek met je eerste check-in klaar.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link
              href={`/auth/login?redirect=${encodeURIComponent(
                `/student?enroll=${course.slug}`,
              )}`}
              className="group inline-flex items-center gap-3 px-7 py-4 rounded-full font-medium transition-all hover:pr-9"
              style={{
                backgroundColor: glow,
                color: "#1A1611",
              }}
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
              className="link-editorial font-medium"
              style={{ color: "#F5F0E6" }}
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

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex items-baseline justify-between py-2.5"
      style={{ borderBottom: "1px solid rgba(245, 240, 230, 0.08)" }}
    >
      <span className="text-label" style={{ color: "#F5F0E6", opacity: 0.6 }}>
        {label}
      </span>
      <span
        className="font-display text-sm"
        style={{ color: "#F5F0E6" }}
      >
        {value}
      </span>
    </div>
  );
}

function StatRow({
  icon,
  label,
  value,
  glow,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  glow: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <span
        className="inline-flex items-center justify-center w-8 h-8 rounded-full shrink-0"
        style={{
          backgroundColor: "rgba(245, 240, 230, 0.06)",
          color: glow,
          border: "1px solid rgba(245, 240, 230, 0.12)",
        }}
      >
        {icon}
      </span>
      <div>
        <p className="text-label mb-1" style={{ color: "#F5F0E6", opacity: 0.55 }}>
          {label}
        </p>
        <p className="font-display text-base" style={{ color: "#F5F0E6" }}>
          {value}
        </p>
      </div>
    </div>
  );
}

function CourseChip({
  title,
  subtitle,
  slug,
  color,
  highlight,
}: {
  title: string;
  subtitle: string | null;
  slug: string;
  color: string;
  highlight?: boolean;
}) {
  return (
    <li>
      <Link
        href={`/courses/${slug}`}
        className="group flex items-center gap-4 p-4 rounded-lg transition-all"
        style={{
          backgroundColor: highlight
            ? "rgba(228, 184, 102, 0.08)"
            : "rgba(245, 240, 230, 0.04)",
          border: `1px solid ${
            highlight
              ? "rgba(228, 184, 102, 0.3)"
              : "rgba(245, 240, 230, 0.1)"
          }`,
        }}
      >
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{
            backgroundColor: color,
            boxShadow: highlight ? `0 0 12px ${color}` : "none",
          }}
        />
        <div className="flex-1 min-w-0">
          <p className="font-display text-lg leading-tight" style={{ color: "#F5F0E6" }}>
            {title}
          </p>
          {subtitle && (
            <p
              className="text-xs mt-1 truncate"
              style={{ color: "#F5F0E6", opacity: 0.6 }}
            >
              {subtitle}
            </p>
          )}
        </div>
        <ArrowRight
          size={14}
          className="transition-transform group-hover:translate-x-1"
          style={{ color: "#F5F0E6", opacity: 0.6 }}
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
