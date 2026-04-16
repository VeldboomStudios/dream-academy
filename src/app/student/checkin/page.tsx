"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Hex } from "@/components/Honeycomb";

const MOODS = [
  { n: 1, label: "Rot", glyph: "×" },
  { n: 2, label: "Zwaar", glyph: "−" },
  { n: 3, label: "Oké", glyph: "○" },
  { n: 4, label: "Goed", glyph: "+" },
  { n: 5, label: "Top", glyph: "★" },
];

export default function CheckinPage() {
  const [mood, setMood] = useState(3);
  const [progress, setProgress] = useState(50);
  const [blocker, setBlocker] = useState("");
  const [needsHelp, setNeedsHelp] = useState(false);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/student/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mood,
        progressSelf: progress,
        blocker: blocker || null,
        needsHelp,
        note: note || null,
      }),
    });
    router.push("/student");
    router.refresh();
  }

  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-50 bg-paper/90 backdrop-blur-xl border-b border-rule-2">
        <div className="mx-auto max-w-[1440px] px-6 md:px-10 h-16 flex items-center justify-between">
          <Link href="/student" className="inline-flex items-center gap-2 text-sm link-editorial">
            <ArrowLeft size={14} /> Terug
          </Link>
          <div className="flex items-center gap-2">
            <Hex size={14} className="text-cyan" filled />
            <span className="font-display">Check-in</span>
          </div>
          <span className="text-label-mono text-muted hidden md:block">~30 sec</span>
        </div>
      </header>

      <section className="px-6 md:px-10 py-12 md:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-label text-cyan mb-6">— Dagelijkse check-in</p>
          <h1 className="text-display mb-4"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}>
            Hoe gaat het
            <br />
            <span className="italic font-light"
              style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144' }}>
              vandaag
            </span>
            <span className="text-cyan">?</span>
          </h1>
          <p className="text-muted text-lg leading-relaxed mb-16 max-w-xl">
            Dit helpt je coach om je beter te begeleiden. Wat jij deelt blijft tussen jou en je coach.
          </p>

          <form onSubmit={onSubmit} className="space-y-14">
            {/* Mood */}
            <fieldset>
              <div className="flex items-end justify-between rule-b pb-4 mb-6">
                <legend className="text-label text-muted">Mood</legend>
                <span className="numerals text-label-mono text-muted">
                  {String(mood).padStart(2, "0")} / 05
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {MOODS.map((m) => (
                  <button
                    key={m.n}
                    type="button"
                    onClick={() => setMood(m.n)}
                    className={`group relative aspect-square rounded-sm flex flex-col items-center justify-center gap-2 border transition-all ${
                      mood === m.n
                        ? "border-cyan bg-cyan text-paper"
                        : "border-rule-2 bg-paper-2 hover:border-cyan/50"
                    }`}
                  >
                    <span className="font-display text-3xl md:text-4xl">{m.glyph}</span>
                    <span className="text-label">{m.label}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Progress slider */}
            <fieldset>
              <div className="flex items-end justify-between rule-b pb-4 mb-6">
                <legend className="text-label text-muted">Voortgang vandaag</legend>
                <span className="numerals font-display text-3xl">
                  {progress}
                  <span className="text-label text-muted ml-1">%</span>
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={progress}
                onChange={(e) => setProgress(parseInt(e.target.value))}
                className="w-full accent-honey"
                aria-label="Voortgang"
              />
              <div className="flex items-center justify-between text-label-mono text-muted mt-2">
                <span>Niets</span>
                <span>Veel</span>
              </div>
            </fieldset>

            {/* Blocker */}
            <fieldset>
              <div className="flex items-end justify-between rule-b pb-4 mb-6">
                <legend className="text-label text-muted">Waar loop je op vast?</legend>
                <span className="text-label-mono text-muted">Optioneel</span>
              </div>
              <textarea
                value={blocker}
                onChange={(e) => setBlocker(e.target.value)}
                rows={3}
                placeholder="Bijv. 'Ik snap niet hoe loops werken'..."
                className="w-full px-4 py-3 bg-paper-2 border border-rule-2 rounded-sm focus:outline-none focus:border-honey text-ink-2 placeholder:text-muted-2 transition-colors font-sans resize-none"
              />
            </fieldset>

            {/* Needs help */}
            <label className="flex items-center gap-4 cursor-pointer group rule-b pb-4">
              <span className="relative w-5 h-5 shrink-0">
                <input
                  type="checkbox"
                  checked={needsHelp}
                  onChange={(e) => setNeedsHelp(e.target.checked)}
                  className="sr-only peer"
                />
                <span className="absolute inset-0 border border-rule-2 rounded-sm peer-checked:bg-cyan peer-checked:border-cyan transition-all" />
                <span className="absolute inset-0 flex items-center justify-center text-paper opacity-0 peer-checked:opacity-100 transition-opacity">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M5 12L10 17L19 7" />
                  </svg>
                </span>
              </span>
              <span className="text-ink-2">Ik kan wat hulp gebruiken van een klasgenoot</span>
            </label>

            {/* Note */}
            <fieldset>
              <div className="flex items-end justify-between rule-b pb-4 mb-6">
                <legend className="text-label text-muted">Andere notitie</legend>
                <span className="text-label-mono text-muted">Optioneel</span>
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 bg-paper-2 border border-rule-2 rounded-sm focus:outline-none focus:border-honey text-ink-2 placeholder:text-muted-2 transition-colors font-sans resize-none"
              />
            </fieldset>

            {/* Submit */}
            <div className="rule-t pt-8 flex items-center justify-between">
              <span className="text-label-mono text-muted">
                {new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}
              </span>
              <button
                type="submit"
                disabled={loading}
                className="group inline-flex items-center gap-3 bg-cyan text-paper px-7 py-4 font-semibold text-sm uppercase tracking-wider transition-all hover:bg-cyan-deep hover:pr-9 disabled:opacity-50"
              >
                <span>{loading ? "Bezig..." : "Versturen"}</span>
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
