"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Hex, Honeycomb } from "@/components/Honeycomb";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const { error } = await res.json();
      setError(error || "Login mislukt");
      return;
    }
    const { role } = await res.json();
    router.push(role === "TEACHER" ? "/teacher" : "/student");
    router.refresh();
  }

  const demos = [
    { label: "Docent", email: "teacher@dream.academy", pass: "teacher123" },
    { label: "Student A", email: "ahmed@demo.nl", pass: "student123" },
    { label: "Student B", email: "layla@demo.nl", pass: "student123" },
  ];

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* LEFT — editorial moment */}
      <div className="relative bg-obsidian text-paper px-6 md:px-10 lg:px-16 py-10 lg:py-14 flex flex-col justify-between overflow-hidden grain">
        <Honeycomb
          className="absolute -right-20 top-20 w-[600px] h-[600px] text-paper opacity-[0.05]"
          cols={7}
          rows={14}
          size={40}
        />

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-label text-paper/60 hover:text-paper transition-colors group w-max relative z-10"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
          Terug
        </Link>

        <div className="relative z-10 max-w-md">
          <p className="text-label text-honey mb-6">— Voor partners</p>
          <h1
            className="text-display text-paper mb-10"
            style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)" }}
          >
            Welkom
            <br />
            <span className="italic font-light"
              style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144' }}>
              terug
            </span>
            <span className="text-honey">.</span>
          </h1>
          <p className="text-lg text-paper/70 leading-relaxed font-display italic font-light"
            style={{ fontVariationSettings: '"SOFT" 60, "WONK" 0, "opsz" 144' }}>
            &ldquo;Een deelnemer komt binnen met een idee. Aan het einde heeft die iets fysieks gemaakt dat bestaat in de wereld.&rdquo;
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between text-label-mono text-paper/40 rule-t border-white/15 pt-5">
          <span>© Veldboom Studios</span>
          <span className="numerals">v0.1 / Amsterdam Zuidoost</span>
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="px-6 md:px-10 lg:px-16 py-10 lg:py-14 flex flex-col justify-between bg-obsidian-2 border-l border-rule-2">
        <div className="flex items-center gap-2">
          <Hex size={18} className="text-honey" filled />
          <span className="font-display text-xl">Dream Academy</span>
        </div>

        <div className="max-w-md w-full mx-auto lg:mx-0">
          <p className="text-label text-muted mb-5">Inloggen</p>
          <h2 className="font-display text-5xl md:text-6xl leading-[1] mb-10">
            Ga verder<span className="text-honey">.</span>
          </h2>

          <form onSubmit={onSubmit} className="space-y-5">
            <FormField
              label="E-mail"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="naam@organisatie.nl"
            />
            <FormField
              label="Wachtwoord"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
            />

            {error && (
              <div className="text-sm text-vermillion font-medium">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group w-full inline-flex items-center justify-center gap-3 bg-paper text-obsidian px-7 py-4 rounded-full font-medium transition-all hover:bg-honey disabled:opacity-50 mt-4"
            >
              <span>{loading ? "Bezig..." : "Inloggen"}</span>
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
          </form>

          <div className="mt-12 rule-t pt-8">
            <p className="text-label text-muted mb-5">Demo accounts</p>
            <div className="space-y-2">
              {demos.map((d) => (
                <button
                  key={d.email}
                  type="button"
                  onClick={() => {
                    setEmail(d.email);
                    setPassword(d.pass);
                  }}
                  className="group w-full flex items-center justify-between py-3 px-4 -mx-4 rounded-lg hover:bg-obsidian transition-colors"
                >
                  <div className="text-left">
                    <div className="text-sm font-medium text-paper">{d.label}</div>
                    <div className="text-xs text-muted numerals">{d.email}</div>
                  </div>
                  <ArrowUpRightSmall />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-label-mono text-muted">
          <Link href="/" className="link-editorial">← dreamacademy.veldboomstudios.com</Link>
        </div>
      </div>
    </main>
  );
}

function FormField({
  label,
  type,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-label text-muted mb-2 block">{label}</span>
      <input
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-transparent border-b border-rule-2 focus:border-honey focus:outline-none text-paper placeholder:text-muted-2 transition-colors"
      />
    </label>
  );
}

function ArrowUpRightSmall() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="text-muted group-hover:text-paper group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all"
    >
      <path d="M7 17L17 7M17 7H8M17 7V16" />
    </svg>
  );
}
