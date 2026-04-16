import Link from "next/link";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { Hex } from "@/components/Honeycomb";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses = await db.course.findMany({
    orderBy: [{ level: "asc" }, { slug: "asc" }],
    include: { modules: true },
  });

  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-50 bg-obsidian/80 backdrop-blur-xl border-b border-rule-2">
        <div className="mx-auto max-w-[1440px] px-6 md:px-10 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Hex size={18} className="text-honey" filled />
            <span className="font-display text-xl tracking-tight">Dream Academy</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm link-editorial"
          >
            <ArrowLeft size={14} /> Terug
          </Link>
        </div>
      </header>

      <section className="px-6 md:px-10 py-16 md:py-24">
        <div className="mx-auto max-w-[1440px]">
          {/* Meta */}
          <div className="flex items-center justify-between rule-b pb-5 mb-12 md:mb-20">
            <div className="flex items-center gap-4 text-label text-muted">
              <span className="numerals">08</span>
              <Hex size={10} className="text-honey" filled />
              <span>cursussen · 04 niveaus</span>
            </div>
            <span className="text-label-mono text-muted hidden md:block">
              Curriculum / MMXXVI
            </span>
          </div>

          {/* Headline */}
          <div className="grid grid-cols-12 gap-6 md:gap-10 mb-20 md:mb-28">
            <div className="col-span-12 lg:col-span-8">
              <p className="text-label text-honey-deep mb-6">— Het curriculum</p>
              <h1
                className="text-display text-paper"
                style={{ fontSize: "clamp(3rem, 8vw, 7.5rem)" }}
              >
                Acht cursussen.
                <br />
                <span className="italic font-light"
                  style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144' }}>
                  Eén
                </span>{" "}
                pipeline<span className="text-honey">.</span>
              </h1>
            </div>
            <div className="col-span-12 lg:col-span-4 lg:pl-10 lg:border-l lg:border-rule-2 lg:self-end">
              <p className="text-lg text-paper/80 leading-relaxed">
                Van je eerste regel code tot een biomimicry-gevalideerd capstone-project.
                Elk pad eindigt met iets dat bestaat in de wereld.
              </p>
            </div>
          </div>

          {/* Levels */}
          {[1, 2, 3, 4].map((level) => {
            const lvlCourses = courses.filter((c) => c.level === level);
            if (lvlCourses.length === 0) return null;
            return (
              <div key={level} className="mb-20 md:mb-28">
                <div className="flex items-end justify-between rule-b pb-5 mb-10">
                  <div className="flex items-baseline gap-5">
                    <span className="numerals text-label text-muted">
                      Niveau {String(level).padStart(2, "0")}
                    </span>
                    <h2 className="font-display text-3xl md:text-4xl">
                      {levelName(level)}
                    </h2>
                  </div>
                  <span className="text-label-mono text-muted">
                    {String(lvlCourses.length).padStart(2, "0")} cursussen
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                  {lvlCourses.map((c, idx) => (
                    <CourseCard
                      key={c.id}
                      num={String(idx + 1 + (level - 1) * 2).padStart(2, "0")}
                      slug={c.slug}
                      title={c.titleNl}
                      subtitle={c.subtitle ?? ""}
                      description={c.description}
                      capstone={c.capstoneBrief ?? ""}
                      weeks={c.durationWeeks}
                      modules={c.modules.length}
                      color={c.colorHex ?? "#C89F4A"}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function CourseCard({
  num,
  slug,
  title,
  subtitle,
  description,
  capstone,
  weeks,
  modules,
}: {
  num: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  capstone: string;
  weeks: number;
  modules: number;
  color: string;
}) {
  return (
    <Link
      href={`/courses/${slug}`}
      className="group relative bg-obsidian-2 p-8 md:p-10 rounded-lg border border-rule-2 hover:border-honey/40 transition-all hover:-translate-y-1 duration-500 block"
    >
      <div className="flex items-start justify-between mb-8">
        <span className="numerals text-label text-muted">§ {num}</span>
        <div className="text-label-mono text-muted text-right">
          <span className="numerals">{String(weeks).padStart(2, "0")}</span> wkn /{" "}
          <span className="numerals">{String(modules).padStart(2, "0")}</span> mod
        </div>
      </div>

      <h3 className="font-display text-4xl md:text-5xl leading-[0.95] mb-4 group-hover:text-honey-deep transition-colors">
        {title}
      </h3>
      <p className="text-label text-honey-deep mb-6">{subtitle}</p>
      <p className="text-paper/80 leading-relaxed mb-8">{description}</p>

      {capstone && (
        <div className="rule-t pt-6">
          <p className="text-label text-muted mb-2">Capstone</p>
          <p className="text-sm font-display italic text-paper leading-snug"
            style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144' }}>
            &ldquo;{capstone}&rdquo;
          </p>
        </div>
      )}

      <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowUpRight size={20} className="text-honey-deep" />
      </div>
    </Link>
  );
}

function levelName(lvl: number): string {
  return ["", "Instap", "Vaardigheden", "Meesterschap", "Integratie"][lvl] || "";
}
