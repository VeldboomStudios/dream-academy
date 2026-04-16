import Link from "next/link";
import { ArrowUpRight, ArrowRight, Sparkles, Users, Wrench } from "lucide-react";
import { Honeycomb, Hex } from "@/components/Honeycomb";

export default function HomePage() {
  return (
    <main className="relative">
      <SiteNav />

      {/* ═══════════════════════════════════════════════════════════
          HERO — institutional, confident, lots of whitespace
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative px-6 md:px-10 pt-12 md:pt-20 pb-20 md:pb-32">
        <div className="mx-auto max-w-[1440px]">
          {/* Meta strip */}
          <div className="flex items-center justify-between rule-b pb-5 mb-14 md:mb-24">
            <div className="flex items-center gap-4 text-label text-muted">
              <span className="numerals">2026</span>
              <Hex size={10} className="text-cyan" filled />
              <span>Amsterdam Zuidoost</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-label text-muted">
              <span>v0.1</span>
              <span>Veldboom Studios</span>
            </div>
          </div>

          {/* Hero grid */}
          <div className="grid grid-cols-12 gap-6 md:gap-10 items-start">
            {/* LEFT: headline */}
            <div className="col-span-12 lg:col-span-8">
              <p className="text-label text-cyan mb-6 animate-fade-up">
                Een educatieplatform
              </p>
              <h1
                className="text-display text-ink-2 animate-fade-up"
                style={{
                  fontSize: "clamp(3.25rem, 10vw, 9.5rem)",
                  animationDelay: "60ms",
                }}
              >
                Van idee
                <br />
                naar <span className="text-cyan">fysiek</span>
                <br />
                product.
              </h1>

              <div
                className="mt-10 md:mt-14 max-w-xl animate-fade-up"
                style={{ animationDelay: "180ms" }}
              >
                <p className="text-lg md:text-xl leading-relaxed text-muted">
                  Een AI-ondersteund curriculum voor maker-onderwijs.
                  Gebouwd voor bibliotheken, scholen en universiteiten.
                  Geworteld in de Bijlmer.
                </p>

                <div className="mt-10 flex flex-wrap items-center gap-6">
                  <Link
                    href="/atlas"
                    className="group inline-flex items-center gap-3 bg-cyan text-paper px-7 py-4 font-semibold text-sm uppercase tracking-wider transition-all hover:bg-cyan-deep hover:pr-9"
                  >
                    <span>Verken de Atlas</span>
                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                  <Link
                    href="/courses"
                    className="link-cyan text-sm font-medium"
                  >
                    Bekijk de acht cursussen
                  </Link>
                </div>
              </div>
            </div>

            {/* RIGHT: honeycomb artifact + meta */}
            <div className="col-span-12 lg:col-span-4 lg:pl-10 lg:border-l lg:border-rule-2 lg:self-stretch relative">
              <div className="sticky top-24">
                <div className="hidden lg:block relative aspect-[3/4] overflow-hidden bg-paper-2 rounded-md">
                  <Honeycomb
                    className="absolute inset-0 w-full h-full text-ink-2"
                    cols={5}
                    rows={13}
                    size={28}
                    accent={[9, 22, 23, 36, 49, 50]}
                    accentColor="#00A6D6"
                  />
                  <div className="absolute bottom-4 left-4 right-4 text-label text-muted flex items-center justify-between">
                    <span>Fig. 01</span>
                    <span>Nassuth / 1968</span>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <MetaRow label="Cursussen" value="08" />
                  <MetaRow label="Niveaus" value="04" />
                  <MetaRow label="Instellingen" value="Bibliotheek / School / Universiteit" />
                  <MetaRow label="Taal" value="NL · EN · Sranang Tongo" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TICKER — cyan strip
      ═══════════════════════════════════════════════════════════ */}
      <section className="bg-cyan text-paper overflow-hidden py-5 relative">
        <div className="flex whitespace-nowrap animate-ticker">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center shrink-0">
              {[
                "Droom",
                "Prototype",
                "Product",
                "Collectief maakproces",
                "Van de buurt",
                "Voor de buurt",
                "AI versterkt, vervangt niet",
                "Leren door doen",
              ].map((word, j) => (
                <span
                  key={j}
                  className="text-display text-3xl md:text-5xl px-10 flex items-center gap-10"
                >
                  {word}
                  <Hex size={12} className="text-paper" filled />
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PRINCIPLES — three numbered tenets
      ═══════════════════════════════════════════════════════════ */}
      <section className="px-6 md:px-10 py-24 md:py-32">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex items-end justify-between rule-b pb-6 mb-16">
            <div>
              <p className="text-label text-cyan mb-2">Overzicht</p>
              <h2 className="text-display text-4xl md:text-5xl text-ink-2">
                Drie principes.
              </h2>
            </div>
            <span className="text-label-mono text-muted hidden md:block">
              § 01 — 03
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <Principle
              num="01"
              title="Voor docenten"
              kicker="AI als co-teacher"
              body="Live inzichten over je klas: wie loopt vast, wie excelleert, waar zit het klassikale patroon. Niet een dashboard dat meer werk oplevert — een dashboard dat werk overneemt."
              icon={<Sparkles size={18} strokeWidth={1.75} />}
            />
            <Principle
              num="02"
              title="Voor studenten"
              kicker="Klasgenoten als netwerk"
              body="Je bent niet alleen. Als jij vastloopt op 3D-modelleren, en Layla excelleert — het systeem stelt haar voor. Eén klik om een intro te sturen."
              icon={<Users size={18} strokeWidth={1.75} />}
            />
            <Principle
              num="03"
              title="Voor instellingen"
              kicker="Deploy in één week"
              body="Acht kant-en-klare cursussen. Gym badge systeem. Digitaal portfolio. Meertalig. Van Dream naar Prototype naar Product — het raamwerk is er al."
              icon={<Wrench size={18} strokeWidth={1.75} />}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          THE PIPELINE — full-bleed on paper-2
      ═══════════════════════════════════════════════════════════ */}
      <section className="bg-paper-2 px-6 md:px-10 py-24 md:py-32 relative overflow-hidden">
        <Honeycomb
          className="absolute -right-40 -top-20 w-[600px] h-[600px] text-ink opacity-[0.04]"
          cols={8}
          rows={14}
          size={40}
        />
        <div className="mx-auto max-w-[1440px] relative">
          <div className="rule-b pb-6 mb-16">
            <p className="text-label text-cyan">De pipeline</p>
          </div>

          <div className="grid grid-cols-12 gap-6 md:gap-10">
            <div className="col-span-12 lg:col-span-5">
              <h3 className="text-display text-ink-2 text-5xl md:text-7xl">
                Droom <span className="text-cyan">→</span>
                <br />
                Prototype <span className="text-cyan">→</span>
                <br />
                Product.
              </h3>
            </div>
            <div className="col-span-12 lg:col-span-6 lg:col-start-7 lg:pt-6">
              <p className="text-xl md:text-2xl font-serif italic font-light text-ink-2 leading-snug mb-10"
                style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144' }}>
                &ldquo;Een deelnemer komt binnen met een idee —
                bijvoorbeeld een robot die planten water geeft.
                Aan het einde heeft diegene iets fysieks gemaakt
                dat bestaat in de wereld.&rdquo;
              </p>

              <div className="grid grid-cols-3 gap-6 rule-t pt-6">
                <Stage n="01" label="Droom" body="Idee definiëren, schetsen, feedback" />
                <Stage n="02" label="Prototype" body="Iteratief bouwen, falen, herbouwen" />
                <Stage n="03" label="Product" body="Documenteren, presenteren, badge" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          COURSES — newspaper-grid index
      ═══════════════════════════════════════════════════════════ */}
      <section className="px-6 md:px-10 py-24 md:py-32">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex items-end justify-between rule-b pb-6 mb-16">
            <div>
              <p className="text-label text-cyan mb-2">Het curriculum</p>
              <h2 className="text-display text-4xl md:text-5xl text-ink-2">
                Acht cursussen.
              </h2>
            </div>
            <Link
              href="/courses"
              className="text-label text-ink hover:text-cyan inline-flex items-center gap-2 group transition-colors"
            >
              Volledig overzicht
              <ArrowUpRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-rule-2 border border-rule-2">
            {COURSES.map((c, i) => (
              <CourseCell key={i} {...c} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          EVIDENCE — dark contrast section with stats
      ═══════════════════════════════════════════════════════════ */}
      <section className="bg-obsidian text-paper px-6 md:px-10 py-24 md:py-32">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid grid-cols-12 gap-6 md:gap-10 items-start">
            <div className="col-span-12 lg:col-span-7">
              <p className="text-label text-cyan mb-8">Track record</p>
              <blockquote className="text-display text-4xl md:text-6xl lg:text-7xl leading-[0.95]">
                Zes jaar
                <br />
                jeugdeducatie,
                <br />
                <span className="text-cyan">250.000+</span>
                <br />
                views,
                <br />
                één missie.
              </blockquote>
            </div>

            <div className="col-span-12 lg:col-span-5 lg:pl-10 lg:border-l lg:border-white/15 space-y-10 pt-4">
              <StatBlock
                num="08"
                label="Cursussen ontworpen"
                detail="Van programmeren tot biomimicry — elke cursus eindigt in een fysiek product."
              />
              <StatBlock
                num="07"
                label="Actieve 3D-printers"
                detail="Bambu Lab + Elegoo fleet. Opschalend naar 200 printers in Lighthouse Chapel."
              />
              <StatBlock
                num="130+"
                label="TUMO leerlingen in het ecosysteem"
                detail="Cross-enrollment via OBA Next Lab Kraaiennest. 80% uit Zuidoost."
              />
              <StatBlock
                num="06+"
                label="Jaar educatie-ervaring"
                detail="SBFK, ZVVT, Kazerne Reigersbos, Basisschool de Knotwilg, MBO-stagiaires."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CTA — final partner call
      ═══════════════════════════════════════════════════════════ */}
      <section className="px-6 md:px-10 py-24 md:py-40">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid grid-cols-12 gap-6 md:gap-10 items-end">
            <div className="col-span-12 lg:col-span-8">
              <p className="text-label text-cyan mb-6">Voor partners</p>
              <h2
                className="text-display text-ink-2"
                style={{ fontSize: "clamp(2.75rem, 7vw, 7rem)" }}
              >
                Laten we het
                <br />
                samen bouwen.
              </h2>
            </div>

            <div className="col-span-12 lg:col-span-4 lg:pl-10 lg:border-l lg:border-rule-2 lg:self-stretch lg:flex lg:items-end">
              <div>
                <p className="text-muted mb-8 leading-relaxed">
                  Voor bibliotheken, scholen, jeugdcentra en universiteiten die hun jonge makers
                  de ruimte willen geven om echt iets te bouwen.
                </p>
                <Link
                  href="/auth/login"
                  className="group inline-flex items-center gap-3 bg-ink text-paper px-7 py-4 font-semibold text-sm uppercase tracking-wider transition-all hover:bg-cyan hover:pr-9"
                >
                  <span>Demo bekijken</span>
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

/* ─── SUB-COMPONENTS ──────────────────────────────── */

function SiteNav() {
  return (
    <header className="sticky top-0 z-50 bg-paper/90 backdrop-blur-xl border-b border-rule-2">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Hex size={18} className="text-cyan" filled />
          <span className="font-display font-bold text-xl tracking-tight text-ink-2">
            Dream Academy
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-10 text-sm font-medium">
          <Link href="/atlas" className="link-editorial inline-flex items-center gap-1.5 text-ink hover:text-cyan transition-colors">
            <Hex size={10} className="text-cyan" filled />
            Atlas
          </Link>
          <Link href="/courses" className="link-editorial text-ink hover:text-cyan transition-colors">
            Curriculum
          </Link>
          <Link href="/auth/login" className="link-editorial text-ink hover:text-cyan transition-colors">
            Demo
          </Link>
        </nav>

        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-sm font-semibold bg-ink text-paper px-4 py-2 hover:bg-cyan transition-colors"
        >
          Inloggen
          <ArrowUpRight size={14} />
        </Link>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="bg-obsidian text-paper/70 px-6 md:px-10 pt-20 pb-10">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid grid-cols-12 gap-6 md:gap-10 mb-16">
          <div className="col-span-12 lg:col-span-6">
            <div className="flex items-center gap-2 mb-6 text-paper">
              <Hex size={18} className="text-cyan" filled />
              <span className="font-display font-bold text-xl">Dream Academy</span>
            </div>
            <p className="text-display text-2xl md:text-3xl text-paper max-w-xl leading-tight">
              Iedereen kan meedoen. Iedereen kan maken.
            </p>
          </div>
          <div className="col-span-6 lg:col-span-2">
            <h4 className="text-label text-cyan mb-4">Platform</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/courses" className="hover:text-paper link-editorial">Curriculum</Link></li>
              <li><Link href="/atlas" className="hover:text-paper link-editorial">Atlas</Link></li>
              <li><Link href="/auth/login" className="hover:text-paper link-editorial">Inloggen</Link></li>
            </ul>
          </div>
          <div className="col-span-6 lg:col-span-2">
            <h4 className="text-label text-cyan mb-4">Veldboom</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="https://veldboomstudios.com" className="hover:text-paper link-editorial">Studios</a></li>
              <li><a href="https://oba-next.vercel.app" className="hover:text-paper link-editorial">OBA Next</a></li>
            </ul>
          </div>
          <div className="col-span-12 lg:col-span-2">
            <h4 className="text-label text-cyan mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="mailto:info@veldboomstudios.com" className="hover:text-paper link-editorial">info@veldboomstudios.com</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex items-center justify-between text-label-mono text-paper/40">
          <span>© 2026 Veldboom Studios</span>
          <span className="numerals">v0.1 — Amsterdam Zuidoost</span>
        </div>
      </div>
    </footer>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 rule-b pb-3">
      <span className="text-label text-muted">{label}</span>
      <span className="numerals text-sm text-ink-2 text-right">{value}</span>
    </div>
  );
}

function Principle({
  num,
  title,
  kicker,
  body,
  icon,
}: {
  num: string;
  title: string;
  kicker: string;
  body: string;
  icon: React.ReactNode;
}) {
  return (
    <article className="col-span-12 lg:col-span-4 group">
      <div className="rule-t pt-5 flex items-start gap-5">
        <span className="numerals text-sm text-muted shrink-0 pt-1">{num}</span>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4 text-ink-2">
            <span className="inline-flex items-center justify-center w-9 h-9 bg-cyan text-paper">
              {icon}
            </span>
            <h3 className="font-display font-bold text-2xl">{title}</h3>
          </div>
          <p className="text-label text-cyan mb-3">{kicker}</p>
          <p className="text-muted leading-relaxed">{body}</p>
        </div>
      </div>
    </article>
  );
}

function Stage({ n, label, body }: { n: string; label: string; body: string }) {
  return (
    <div>
      <div className="numerals text-label text-muted mb-3">{n}</div>
      <div className="font-display font-bold text-xl mb-2 text-ink-2">{label}</div>
      <div className="text-sm text-muted leading-relaxed">{body}</div>
    </div>
  );
}

function StatBlock({ num, label, detail }: { num: string; label: string; detail: string }) {
  return (
    <div className="border-t border-white/15 pt-6">
      <div className="flex items-baseline gap-4">
        <span className="font-display font-bold text-5xl md:text-6xl text-paper leading-none">
          {num}
        </span>
        <span className="text-label text-cyan">{label}</span>
      </div>
      <p className="mt-3 text-sm text-paper/60 leading-relaxed max-w-sm">{detail}</p>
    </div>
  );
}

/* ─── COURSE DATA ──────────────────────────────────── */

const COURSES = [
  { num: "01", level: "Instap", title: "De Eerste Lijn", subtitle: "Programmeren", weeks: 4, slug: "de-eerste-lijn" },
  { num: "02", level: "Instap", title: "De Dromer", subtitle: "Solarpunk Design", weeks: 4, slug: "de-dromer" },
  { num: "03", level: "Vaardigheden", title: "De Architect", subtitle: "3D Modelleren", weeks: 8, slug: "de-architect" },
  { num: "04", level: "Vaardigheden", title: "De Maker", subtitle: "3D Printen", weeks: 8, slug: "de-maker" },
  { num: "05", level: "Vaardigheden", title: "De Roboticus", subtitle: "Robotica", weeks: 8, slug: "de-roboticus" },
  { num: "06", level: "Meesterschap", title: "De Natuur-Ingenieur", subtitle: "Biomimicry", weeks: 12, slug: "de-natuur-ingenieur" },
  { num: "07", level: "Meesterschap", title: "De Wereldbouwer", subtitle: "Game Development", weeks: 12, slug: "de-wereldbouwer" },
  { num: "08", level: "Integratie", title: "De Meester", subtitle: "Capstone Project", weeks: 12, slug: "de-meester" },
];

function CourseCell({
  num,
  level,
  title,
  subtitle,
  weeks,
  slug,
}: {
  num: string;
  level: string;
  title: string;
  subtitle: string;
  weeks: number;
  slug: string;
}) {
  return (
    <Link
      href={`/courses/${slug}`}
      className="group bg-paper p-8 lg:p-10 min-h-[260px] flex flex-col justify-between transition-colors hover:bg-cyan-soft"
    >
      <div className="flex items-start justify-between">
        <span className="numerals text-label text-muted">{num}</span>
        <span className="text-label text-muted">{level}</span>
      </div>
      <div className="mt-16">
        <h3 className="font-display font-bold text-2xl md:text-3xl leading-tight mb-2 text-ink-2 group-hover:text-cyan-deep transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted mb-6">{subtitle}</p>
        <div className="flex items-center justify-between rule-t pt-4">
          <span className="text-label-mono text-muted">
            <span className="numerals">{weeks.toString().padStart(2, "0")}</span> weken
          </span>
          <ArrowUpRight
            size={16}
            className="text-muted transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-cyan"
          />
        </div>
      </div>
    </Link>
  );
}
