import Link from "next/link";
import { ArrowUpRight, Sparkles, Users, Wrench, ArrowRight } from "lucide-react";
import { Honeycomb, Hex } from "@/components/Honeycomb";

export default function HomePage() {
  return (
    <main className="relative">
      <GrainOverlay />
      <SiteNav />

      {/* ═══════════════════════════════════════════════════════════
          HERO — editorial composition, asymmetric
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative px-6 md:px-10 pt-10 md:pt-16 pb-24 md:pb-32">
        <div className="mx-auto max-w-[1440px]">
          {/* Meta strip */}
          <div className="flex items-center justify-between rule-b pb-5 mb-12 md:mb-20">
            <div className="flex items-center gap-4 text-label text-muted">
              <span className="numerals">MMXXVI</span>
              <Hex size={10} className="text-honey" filled />
              <span>Amsterdam Zuidoost</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-label text-muted">
              <span>Editie 01</span>
              <span>Veldboom Studios</span>
            </div>
          </div>

          {/* Hero grid */}
          <div className="grid grid-cols-12 gap-6 md:gap-10 items-start">
            {/* LEFT: headline */}
            <div className="col-span-12 lg:col-span-8">
              <p className="text-label text-honey-deep mb-6 animate-fade-up">
                — Een educatieplatform
              </p>
              <h1
                className="text-display text-paper animate-fade-up"
                style={{
                  fontSize: "clamp(3.5rem, 11vw, 11rem)",
                  animationDelay: "60ms",
                }}
              >
                Van idee
                <br />
                naar <span className="italic font-light" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144' }}>fysiek</span>
                <br />
                product<span className="text-honey">.</span>
              </h1>

              <div
                className="mt-10 max-w-xl animate-fade-up"
                style={{ animationDelay: "180ms" }}
              >
                <p className="text-lg md:text-xl leading-relaxed text-paper/80">
                  Een AI-ondersteund curriculum voor maker-onderwijs.
                  Gebouwd voor libraries, scholen en universiteiten.
                  Geworteld in de Bijlmer.
                </p>

                <div className="mt-10 flex flex-wrap items-center gap-6">
                  <Link
                    href="/atlas"
                    className="group inline-flex items-center gap-3 bg-paper text-obsidian px-7 py-4 rounded-full font-medium transition-all hover:bg-honey hover:pr-9"
                  >
                    <span>Verken de Atlas</span>
                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                  <Link
                    href="/auth/login"
                    className="link-editorial text-paper font-medium"
                  >
                    Inloggen
                  </Link>
                  <Link
                    href="/courses"
                    className="link-editorial text-paper font-medium"
                  >
                    Bekijk de acht cursussen
                  </Link>
                </div>
              </div>
            </div>

            {/* RIGHT: honeycomb artifact + meta */}
            <div className="col-span-12 lg:col-span-4 lg:pl-10 lg:border-l lg:border-rule-2 lg:self-stretch relative">
              <div className="sticky top-24">
                <div className="hidden lg:block relative aspect-[3/4] overflow-hidden bg-obsidian-2 rounded-sm">
                  <Honeycomb
                    className="absolute inset-0 w-full h-full text-paper"
                    cols={5}
                    rows={13}
                    size={28}
                    accent={[9, 22, 23, 36, 49, 50]}
                  />
                  <div className="absolute bottom-4 left-4 right-4 text-label text-paper flex items-center justify-between">
                    <span>Fig. 01</span>
                    <span>Nassuth / 1968</span>
                  </div>
                </div>

                <div className="mt-8 space-y-5">
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
          TICKER — marquee of values
      ═══════════════════════════════════════════════════════════ */}
      <section className="bg-paper text-obsidian overflow-hidden py-6 relative">
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
                  className="text-display text-4xl md:text-6xl px-10 flex items-center gap-10"
                >
                  {word}
                  <Hex size={14} className="text-honey" filled />
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PRINCIPLES — three numbered tenets, editorial
      ═══════════════════════════════════════════════════════════ */}
      <section className="px-6 md:px-10 py-24 md:py-32">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex items-end justify-between rule-b pb-6 mb-16">
            <h2 className="text-label text-muted">Drie principes</h2>
            <span className="text-label-mono text-muted">§ 01 — 03</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <Principle
              num="01"
              title="Voor docenten"
              kicker="AI als co-teacher"
              body="Live inzichten over je klas: wie loopt vast, wie excelleert, waar zit het klassikale patroon. Niet een dashboard dat meer werk oplevert — een dashboard dat werk overneemt."
              icon={<Sparkles size={18} strokeWidth={1.5} />}
            />
            <Principle
              num="02"
              title="Voor studenten"
              kicker="Klasgenoten als netwerk"
              body="Je bent niet alleen. Als jij vastloopt op 3D-modelleren, en Layla excelleert — het systeem stelt haar voor. Eén klik om een intro te sturen."
              icon={<Users size={18} strokeWidth={1.5} />}
            />
            <Principle
              num="03"
              title="Voor instellingen"
              kicker="Deploy in één week"
              body="Acht kant-en-klare cursussen. Gym badge systeem. Digitaal portfolio. Meertalig. Van Dream naar Prototype naar Product — het raamwerk is er al."
              icon={<Wrench size={18} strokeWidth={1.5} />}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          THE PIPELINE — full-bleed editorial moment
      ═══════════════════════════════════════════════════════════ */}
      <section className="bg-obsidian-2 px-6 md:px-10 py-24 md:py-32 relative overflow-hidden">
        <Honeycomb
          className="absolute -right-40 -top-20 w-[600px] h-[600px] text-paper opacity-[0.08]"
          cols={8}
          rows={14}
          size={40}
        />
        <div className="mx-auto max-w-[1440px] relative">
          <div className="rule-b pb-6 mb-16">
            <h2 className="text-label text-muted">De pipeline</h2>
          </div>

          <div className="grid grid-cols-12 gap-6 md:gap-10">
            <div className="col-span-12 lg:col-span-5">
              <h3 className="text-display text-paper text-5xl md:text-7xl">
                Droom <span className="text-honey">→</span>
                <br />
                Prototype <span className="text-honey">→</span>
                <br />
                Product<span className="text-honey">.</span>
              </h3>
            </div>
            <div className="col-span-12 lg:col-span-6 lg:col-start-7 lg:pt-6">
              <p className="text-xl md:text-2xl font-display italic font-light text-paper/80 leading-snug mb-10">
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
            <h2 className="text-label text-muted">Het curriculum</h2>
            <Link
              href="/courses"
              className="text-label text-paper hover:text-honey-deep inline-flex items-center gap-2 group"
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
          EVIDENCE — pull quote + stats
      ═══════════════════════════════════════════════════════════ */}
      <section className="bg-obsidian-3 text-paper px-6 md:px-10 py-24 md:py-32 grain">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid grid-cols-12 gap-6 md:gap-10 items-start">
            <div className="col-span-12 lg:col-span-7">
              <p className="text-label text-honey mb-8">— Track record</p>
              <blockquote className="text-display text-4xl md:text-6xl lg:text-7xl leading-[0.95]">
                Zes jaar
                <br />
                jeugdeducatie,
                <br />
                <span className="italic font-light" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144' }}>
                  250.000+
                </span>
                <br />
                views,
                <br />
                één missie<span className="text-honey">.</span>
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
          CTA — minimal, warm, final word
      ═══════════════════════════════════════════════════════════ */}
      <section className="px-6 md:px-10 py-24 md:py-40">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid grid-cols-12 gap-6 md:gap-10 items-end">
            <div className="col-span-12 lg:col-span-8">
              <p className="text-label text-honey-deep mb-6">— Voor partners</p>
              <h2
                className="text-display text-paper"
                style={{ fontSize: "clamp(3rem, 8vw, 8rem)" }}
              >
                Laten we het
                <br />
                <span className="italic font-light" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144' }}>samen</span>
                bouwen<span className="text-honey">.</span>
              </h2>
            </div>

            <div className="col-span-12 lg:col-span-4 lg:pl-10 lg:border-l lg:border-rule-2 lg:self-stretch lg:flex lg:items-end">
              <div>
                <p className="text-paper/80 mb-8 leading-relaxed">
                  Voor libraries, scholen, jeugdcentra en universiteiten die hun jonge makers
                  de ruimte willen geven om echt iets te bouwen.
                </p>
                <Link
                  href="/auth/login"
                  className="group inline-flex items-center gap-3 bg-honey text-obsidian px-7 py-4 rounded-full font-medium transition-all hover:bg-honey-deep hover:pr-9"
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
    <header className="sticky top-0 z-50 bg-obsidian/80 backdrop-blur-xl border-b border-rule-2">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Hex size={18} className="text-honey" filled />
          <span className="font-display text-xl tracking-tight">Dream Academy</span>
        </Link>

        <nav className="hidden md:flex items-center gap-10 text-sm">
          <Link href="/atlas" className="link-editorial inline-flex items-center gap-1.5">
            <Hex size={10} className="text-honey" filled />
            Atlas
          </Link>
          <Link href="/courses" className="link-editorial">
            Curriculum
          </Link>
          <Link href="/auth/login" className="link-editorial">
            Demo
          </Link>
        </nav>

        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-sm font-medium bg-paper text-obsidian px-4 py-2 rounded-full hover:bg-honey transition-colors"
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
    <footer className="bg-obsidian-3 text-paper/70 px-6 md:px-10 pt-20 pb-10">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid grid-cols-12 gap-6 md:gap-10 mb-16">
          <div className="col-span-12 lg:col-span-6">
            <div className="flex items-center gap-2 mb-6 text-paper">
              <Hex size={18} className="text-honey" filled />
              <span className="font-display text-xl">Dream Academy</span>
            </div>
            <p className="text-display italic font-light text-2xl md:text-3xl text-paper max-w-xl leading-tight"
              style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144' }}>
              &ldquo;Iedereen kan meedoen. Iedereen kan maken.&rdquo;
            </p>
          </div>
          <div className="col-span-6 lg:col-span-2">
            <h4 className="text-label text-honey mb-4">Platform</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/courses" className="hover:text-paper link-editorial">Curriculum</Link></li>
              <li><Link href="/auth/login" className="hover:text-paper link-editorial">Inloggen</Link></li>
            </ul>
          </div>
          <div className="col-span-6 lg:col-span-2">
            <h4 className="text-label text-honey mb-4">Veldboom</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="https://veldboomstudios.com" className="hover:text-paper link-editorial">Studios</a></li>
              <li><a href="https://oba-next.vercel.app" className="hover:text-paper link-editorial">OBA Next</a></li>
            </ul>
          </div>
          <div className="col-span-12 lg:col-span-2">
            <h4 className="text-label text-honey mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="mailto:info@veldboomstudios.com" className="hover:text-paper link-editorial">info@veldboomstudios.com</a></li>
            </ul>
          </div>
        </div>

        <div className="rule-t border-t border-white/10 pt-6 flex items-center justify-between text-label-mono text-paper/40">
          <span>© MMXXVI Veldboom Studios</span>
          <span className="numerals">v0.1 — Amsterdam Zuidoost</span>
        </div>
      </div>
    </footer>
  );
}

function GrainOverlay() {
  return <div className="grain fixed inset-0 pointer-events-none z-[1]" />;
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 rule-b pb-3">
      <span className="text-label text-muted">{label}</span>
      <span className="numerals text-sm text-paper text-right">{value}</span>
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
          <div className="flex items-center gap-3 mb-4 text-paper">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-rule-2 bg-obsidian-2">
              {icon}
            </span>
            <h3 className="font-display text-2xl">{title}</h3>
          </div>
          <p className="text-label text-honey-deep mb-3">{kicker}</p>
          <p className="text-paper/80 leading-relaxed">{body}</p>
        </div>
      </div>
    </article>
  );
}

function Stage({ n, label, body }: { n: string; label: string; body: string }) {
  return (
    <div>
      <div className="numerals text-label text-muted mb-3">{n}</div>
      <div className="font-display text-xl mb-2">{label}</div>
      <div className="text-sm text-paper/80 leading-relaxed">{body}</div>
    </div>
  );
}

function StatBlock({ num, label, detail }: { num: string; label: string; detail: string }) {
  return (
    <div className="rule-t border-white/15 pt-6">
      <div className="flex items-baseline gap-4">
        <span className="font-display text-5xl md:text-6xl text-paper leading-none">{num}</span>
        <span className="text-label text-paper/60">{label}</span>
      </div>
      <p className="mt-3 text-sm text-paper/60 leading-relaxed max-w-sm">{detail}</p>
    </div>
  );
}

/* ─── COURSE DATA ──────────────────────────────────── */

const COURSES = [
  { num: "01", level: "Instap", title: "De Eerste Lijn", subtitle: "Programmeren", weeks: 4 },
  { num: "02", level: "Instap", title: "De Dromer", subtitle: "Solarpunk Design", weeks: 4 },
  { num: "03", level: "Vaardigheden", title: "De Architect", subtitle: "3D Modelleren", weeks: 8 },
  { num: "04", level: "Vaardigheden", title: "De Maker", subtitle: "3D Printen", weeks: 8 },
  { num: "05", level: "Vaardigheden", title: "De Roboticus", subtitle: "Robotica", weeks: 8 },
  { num: "06", level: "Meesterschap", title: "De Natuur-Ingenieur", subtitle: "Biomimicry", weeks: 12 },
  { num: "07", level: "Meesterschap", title: "De Wereldbouwer", subtitle: "Game Development", weeks: 12 },
  { num: "08", level: "Integratie", title: "De Meester", subtitle: "Capstone Project", weeks: 12 },
];

function CourseCell({
  num,
  level,
  title,
  subtitle,
  weeks,
}: {
  num: string;
  level: string;
  title: string;
  subtitle: string;
  weeks: number;
}) {
  return (
    <Link
      href="/courses"
      className="group bg-obsidian p-8 lg:p-10 min-h-[260px] flex flex-col justify-between transition-colors hover:bg-obsidian-2"
    >
      <div className="flex items-start justify-between">
        <span className="numerals text-label text-muted">{num}</span>
        <span className="text-label text-muted">{level}</span>
      </div>
      <div className="mt-16">
        <h3 className="font-display text-3xl leading-tight mb-2 group-hover:text-honey-deep transition-colors">
          {title}
        </h3>
        <p className="text-sm text-paper/80 mb-6">{subtitle}</p>
        <div className="flex items-center justify-between rule-t pt-4">
          <span className="text-label-mono text-muted">
            <span className="numerals">{weeks.toString().padStart(2, "0")}</span> weken
          </span>
          <ArrowUpRight
            size={16}
            className="text-paper transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-honey-deep"
          />
        </div>
      </div>
    </Link>
  );
}
