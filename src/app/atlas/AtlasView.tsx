"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  X,
  Menu,
  Compass,
  Lock,
  Unlock,
  Play,
  Square,
} from "lucide-react";
import { AtlasScene } from "@/components/atlas/Scene";
import {
  BODY_BY_ID,
  BODIES,
  JOURNEYS,
  getChildren,
  getGroupedNavigation,
  type JourneyPath,
  type AstronautPlacement,
} from "@/components/atlas/graph";
import { Hex } from "@/components/Honeycomb";

const TOUR_STEP_MS = 4500;

export default function AtlasView({
  astronauts,
}: {
  astronauts: AstronautPlacement[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [navOpen, setNavOpen] = useState(false);
  const [activeJourney, setActiveJourney] = useState<JourneyPath | null>(null);
  const [tourStep, setTourStep] = useState(0);
  // Mobile bottom-sheet: collapsed by default so planets are visible
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const tourTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-expand sheet when a planet is selected (so the user sees the details),
  // auto-collapse when deselecting.
  useEffect(() => {
    setSheetExpanded(!!selectedId);
  }, [selectedId]);

  const selected = selectedId ? BODY_BY_ID.get(selectedId) ?? null : null;
  const Icon = selected?.icon;
  const parent = selected?.parentId
    ? BODY_BY_ID.get(selected.parentId)
    : null;
  const children = selected ? getChildren(selected.id) : [];

  // Course navigation derived data
  const prereqs = selected?.prereqs?.map((id) => BODY_BY_ID.get(id)).filter(Boolean) ?? [];
  const unlocks = selected?.unlocks?.map((id) => BODY_BY_ID.get(id)).filter(Boolean) ?? [];

  // Tour engine
  useEffect(() => {
    if (!activeJourney) return;
    setSelectedId(activeJourney.stops[0]);
    setTourStep(0);
    tourTimerRef.current = setInterval(() => {
      setTourStep((step) => {
        const next = step + 1;
        if (next >= activeJourney.stops.length) {
          // End of tour — stop and return to overview after a beat
          if (tourTimerRef.current) clearInterval(tourTimerRef.current);
          setTimeout(() => {
            setActiveJourney(null);
            setSelectedId(null);
          }, 2000);
          return step;
        }
        setSelectedId(activeJourney.stops[next]);
        return next;
      });
    }, TOUR_STEP_MS);
    return () => {
      if (tourTimerRef.current) clearInterval(tourTimerRef.current);
    };
  }, [activeJourney]);

  function stopTour() {
    if (tourTimerRef.current) clearInterval(tourTimerRef.current);
    setActiveJourney(null);
    setTourStep(0);
  }

  return (
    <main
      className="relative min-h-screen overflow-hidden grain"
      style={{ backgroundColor: "#120C07", color: "#F5F0E6" }}
    >
      {/* ─── HEADER ───────────────────────────────────── */}
      <header className="absolute top-0 left-0 right-0 z-30 px-4 md:px-10 py-4 md:py-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm hover:opacity-100 transition-opacity"
          style={{ color: "#F5F0E6", opacity: 0.85 }}
        >
          <ArrowLeft size={14} />
          <span className="link-editorial hidden sm:inline">Terug naar 2D</span>
          <span className="link-editorial sm:hidden">Terug</span>
        </Link>

        <div className="flex items-center gap-2">
          <Hex size={16} className="text-honey" filled />
          <span className="font-display text-base md:text-xl" style={{ color: "#F5F0E6" }}>
            Atlas
          </span>
        </div>

        <button
          onClick={() => setNavOpen((o) => !o)}
          className="inline-flex items-center gap-2 text-label px-3 py-2 rounded-full backdrop-blur-sm transition-colors"
          style={{
            color: "#F5F0E6",
            backgroundColor: navOpen
              ? "rgba(0, 166, 214, 0.2)"
              : "rgba(10, 7, 4, 0.5)",
            border: "1px solid rgba(245, 240, 230, 0.12)",
          }}
          aria-label="Open navigatie"
        >
          <Menu size={14} />
          <span className="hidden md:inline">Alle pagina&apos;s</span>
        </button>
      </header>

      {/* ─── 3D CANVAS ────────────────────────────────── */}
      <div className="absolute inset-0">
        <Suspense fallback={<LoadingScreen />}>
          <AtlasScene
            selectedId={selectedId}
            hoveredId={hoveredId}
            highlightedJourney={activeJourney?.stops ?? null}
            astronauts={astronauts}
            onSelect={(id) => {
              if (activeJourney) stopTour();
              setSelectedId(id);
            }}
            onHover={setHoveredId}
          />
        </Suspense>
      </div>

      {/* ─── INTRO PANEL (when idle, no tour) ─────────── */}
      {!selectedId && !activeJourney && (
        <>
          {/* DESKTOP: top-left floating card */}
          <div
            className="hidden md:block absolute top-24 left-10 max-w-sm z-10 pointer-events-auto p-6 rounded-xl backdrop-blur-sm"
            style={{
              backgroundColor: "rgba(10, 7, 4, 0.6)",
              border: "1px solid rgba(245, 240, 230, 0.08)",
            }}
          >
            <p className="text-label mb-4" style={{ color: "#00A6D6" }}>
              Zonnestelsel
            </p>
            <h1
              className="text-display mb-5 leading-[0.95]"
              style={{
                fontSize: "clamp(2rem, 3.5vw, 3rem)",
                color: "#F5F0E6",
              }}
            >
              Vind jouw pad<span style={{ color: "#00A6D6" }}>.</span>
            </h1>
            <p
              className="text-sm leading-relaxed mb-6"
              style={{ color: "#F5F0E6", opacity: 0.82 }}
            >
              Vier banen, vier niveaus. Begin bij <strong>Niveau I</strong>{" "}
              en werk je naar buiten — elk niveau bouwt voort op het vorige.
              Of laat je de reis tonen.
            </p>

            <div className="space-y-2">
              <p className="text-label mb-2" style={{ color: "#00A6D6" }}>
                Volg een reis
              </p>
              {JOURNEYS.map((j) => (
                <JourneyButton key={j.id} j={j} onStart={() => setActiveJourney(j)} />
              ))}
            </div>
          </div>

          {/* MOBILE: bottom sheet, collapsible */}
          <div
            className="md:hidden absolute left-0 right-0 bottom-0 z-10 pointer-events-auto"
          >
            <button
              type="button"
              onClick={() => setSheetExpanded((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-3 backdrop-blur-md"
              style={{
                backgroundColor: "rgba(10, 7, 4, 0.82)",
                borderTop: "1px solid rgba(245, 240, 230, 0.12)",
              }}
              aria-expanded={sheetExpanded}
              aria-label={sheetExpanded ? "Paneel sluiten" : "Paneel openen"}
            >
              <div className="flex items-center gap-2">
                <Compass size={14} style={{ color: "#00A6D6" }} />
                <span className="text-label" style={{ color: "#F5F0E6" }}>
                  {sheetExpanded ? "Sluiten" : "Volg een reis"}
                </span>
              </div>
              <ChevronIcon open={sheetExpanded} />
            </button>

            <div
              className="overflow-hidden transition-[max-height] duration-300 ease-out backdrop-blur-md"
              style={{
                maxHeight: sheetExpanded ? "55vh" : "0",
                backgroundColor: "rgba(10, 7, 4, 0.82)",
                overflowY: sheetExpanded ? "auto" : "hidden",
              }}
            >
              <div className="px-5 pt-2 pb-6">
                <p
                  className="text-sm leading-relaxed mb-5"
                  style={{ color: "#F5F0E6", opacity: 0.82 }}
                >
                  Vier banen, vier niveaus. Begin bij <strong>Niveau I</strong>{" "}
                  en werk je naar buiten.
                </p>
                <div className="space-y-2">
                  {JOURNEYS.map((j) => (
                    <JourneyButton
                      key={j.id}
                      j={j}
                      onStart={() => {
                        setActiveJourney(j);
                        setSheetExpanded(false);
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Hint — desktop only, tap-on-mobile is obvious */}
          <div className="hidden md:block absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <p
              className="text-label text-center px-4 py-2 rounded-full backdrop-blur-sm"
              style={{
                color: "#F5F0E6",
                opacity: 0.85,
                backgroundColor: "rgba(10, 7, 4, 0.6)",
                border: "1px solid rgba(245, 240, 230, 0.08)",
              }}
            >
              Sleep om te roteren · Scroll om te zoomen · Klik op een hemellichaam
            </p>
          </div>
        </>
      )}

      {/* ─── LEGEND (visible when fully idle, desktop only) ────── */}
      {!selectedId && !activeJourney && (
        <div
          className="hidden md:block absolute bottom-8 right-10 z-10 pointer-events-none p-5 rounded-xl backdrop-blur-sm max-w-[240px]"
          style={{
            backgroundColor: "rgba(10, 7, 4, 0.55)",
            border: "1px solid rgba(245, 240, 230, 0.08)",
          }}
        >
          <p className="text-label mb-3" style={{ color: "#E4B866" }}>
            Legenda
          </p>
          <ul className="space-y-2.5 text-xs" style={{ color: "#F5F0E6" }}>
            <li className="flex items-center gap-3">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ background: "#FFD278", boxShadow: "0 0 8px #FFD278" }}
              />
              <span>Zon — de kern</span>
            </li>
            <li className="flex items-center gap-3">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ background: "#E4B866" }}
              />
              <span>Planeet — cursus of dashboard</span>
            </li>
            <li className="flex items-center gap-3">
              <span
                className="inline-block w-2 h-2"
                style={{
                  background: "#E4B866",
                  clipPath:
                    "polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)",
                }}
              />
              <span>Gym badge (maan)</span>
            </li>
            <li className="flex items-center gap-3">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ background: "#C08454" }}
              />
              <span>Feature-maan</span>
            </li>
          </ul>
        </div>
      )}

      {/* ─── TOUR PROGRESS STRIP ─────────────────────── */}
      {activeJourney && (
        <div
          className="absolute top-20 md:top-24 left-3 right-3 md:left-1/2 md:right-auto md:-translate-x-1/2 z-20 pointer-events-auto p-3 md:p-4 rounded-2xl backdrop-blur-md"
          style={{
            backgroundColor: "rgba(10, 7, 4, 0.82)",
            border: "1px solid rgba(0, 166, 214, 0.35)",
            maxWidth: "calc(100vw - 1.5rem)",
            minWidth: "min(90vw, 520px)",
          }}
        >
          <div className="flex items-center gap-4 mb-3">
            <Compass size={16} style={{ color: "#E4B866" }} />
            <div className="flex-1">
              <div
                className="text-label"
                style={{ color: "#E4B866" }}
              >
                Reis · stap {tourStep + 1} / {activeJourney.stops.length}
              </div>
              <div
                className="font-display text-base leading-tight mt-0.5"
                style={{ color: "#F5F0E6" }}
              >
                {activeJourney.title}
              </div>
            </div>
            <button
              onClick={stopTour}
              className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full transition-colors"
              style={{
                color: "#F5F0E6",
                border: "1px solid rgba(245, 240, 230, 0.2)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "rgba(245, 240, 230, 0.08)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <Square size={10} fill="currentColor" />
              Stop
            </button>
          </div>

          {/* Step beads */}
          <ol className="flex items-center gap-1.5 overflow-x-auto">
            {activeJourney.stops.map((stopId, i) => {
              const stop = BODY_BY_ID.get(stopId);
              const isActive = i === tourStep;
              const isPast = i < tourStep;
              return (
                <li key={stopId} className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      setTourStep(i);
                      setSelectedId(stopId);
                    }}
                    className="group flex items-center gap-2 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all"
                    style={{
                      backgroundColor: isActive
                        ? "#E4B866"
                        : isPast
                          ? "rgba(228, 184, 102, 0.18)"
                          : "rgba(245, 240, 230, 0.05)",
                      color: isActive ? "#1A1611" : "#F5F0E6",
                      border: `1px solid ${
                        isActive
                          ? "transparent"
                          : "rgba(245, 240, 230, 0.12)"
                      }`,
                      fontWeight: isActive ? 600 : 400,
                      opacity: isPast || isActive ? 1 : 0.7,
                    }}
                  >
                    <span className="numerals text-[10px]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{stop?.label ?? stopId}</span>
                  </button>
                  {i < activeJourney.stops.length - 1 && (
                    <ArrowRight
                      size={11}
                      style={{
                        color: isPast ? "#E4B866" : "rgba(245,240,230,0.3)",
                      }}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {/* ─── SIDEBAR NAVIGATION ──────────────────────── */}
      <SidebarNav
        open={navOpen}
        onClose={() => setNavOpen(false)}
        onNavigate={(id) => {
          setSelectedId(id);
          setNavOpen(false);
        }}
        selectedId={selectedId}
      />

      {/* ─── SELECTION PANEL — top-left card on desktop, bottom sheet on mobile ── */}
      {selected && (
        <div
          className={`
            absolute z-20 animate-fade-up
            md:top-24 md:left-10 md:max-w-md md:w-[min(92vw,420px)]
            left-0 right-0 bottom-0 md:bottom-auto md:right-auto
          `}
        >
          {/* Mobile handle — tap to collapse back to a thin bar */}
          <button
            type="button"
            onClick={() => setSheetExpanded((v) => !v)}
            className="md:hidden w-full flex items-center justify-between px-5 py-3 backdrop-blur-md"
            style={{
              backgroundColor: "rgba(10, 7, 4, 0.82)",
              borderTop: "1px solid rgba(245, 240, 230, 0.12)",
            }}
            aria-expanded={sheetExpanded}
            aria-label={sheetExpanded ? "Details sluiten" : "Details tonen"}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: selected.glowColor ?? selected.color }}
              />
              <span
                className="font-display text-sm truncate"
                style={{ color: "#F5F0E6" }}
              >
                {selected.label}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <ChevronIcon open={sheetExpanded} />
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedId(null);
                }}
                role="button"
                aria-label="Selectie wissen"
                className="w-7 h-7 inline-flex items-center justify-center rounded-full"
                style={{ border: "1px solid rgba(245, 240, 230, 0.2)", color: "#F5F0E6" }}
              >
                <X size={12} />
              </span>
            </div>
          </button>

          <div
            className={`
              bg-paper text-ink overflow-y-auto
              md:rounded-xl md:shadow-2xl md:p-7 md:max-h-[calc(100vh-8rem)]
              px-5 py-5 transition-[max-height] duration-300 ease-out
              ${sheetExpanded ? "max-h-[70vh]" : "max-h-0 py-0"}
              md:max-h-[calc(100vh-8rem)] md:py-7
            `}
            style={{ boxShadow: "0 30px 60px -15px rgba(0,0,0,0.6)" }}
          >
            {/* Breadcrumb */}
            {(parent || selected.kind !== "sun") && (
              <div className="flex items-center gap-2 mb-4 text-label text-muted flex-wrap">
                <button
                  onClick={() => setSelectedId(null)}
                  className="hover:text-ink transition-colors"
                >
                  Zon
                </button>
                {parent && (
                  <>
                    <span>›</span>
                    <button
                      onClick={() => setSelectedId(parent.id)}
                      className="hover:text-ink transition-colors"
                    >
                      {parent.label}
                    </button>
                  </>
                )}
                <span>›</span>
                <span style={{ color: "#1A1611" }}>{selected.label}</span>
              </div>
            )}

            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                {Icon && (
                  <span
                    className="inline-flex items-center justify-center w-10 h-10 rounded-full"
                    style={{
                      background:
                        selected.kind === "sun"
                          ? "#FFF3D0"
                          : selected.kind === "planet"
                            ? "#F5E8D2"
                            : "#EDE6D7",
                      color: selected.color,
                    }}
                  >
                    <Icon size={18} strokeWidth={1.8} />
                  </span>
                )}
                <div>
                  <p className="text-label text-muted flex items-center gap-2">
                    {selected.level && (
                      <span
                        className="inline-flex items-center justify-center px-1.5 rounded font-mono"
                        style={{
                          background: "#1A1611",
                          color: "#FFD278",
                          fontSize: "9px",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {romanLevel(selected.level)}
                      </span>
                    )}
                    {kindLabel(selected.kind)}
                    {selected.meta && ` · ${selected.meta}`}
                  </p>
                  <h2 className="font-display text-2xl leading-tight">
                    {selected.label}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="w-8 h-8 inline-flex items-center justify-center rounded-full border border-rule-2 hover:bg-paper-2 transition-colors shrink-0"
                aria-label="Sluiten"
              >
                <X size={14} />
              </button>
            </div>

            <p className="text-ink-2 leading-relaxed mb-6">
              {selected.description}
            </p>

            {/* Curriculum progression — prereqs + unlocks */}
            {(prereqs.length > 0 || unlocks.length > 0) && (
              <div className="rule-t pt-5 mb-5 space-y-5">
                {/* Prereqs */}
                <div>
                  <p className="text-label text-muted mb-3 inline-flex items-center gap-1.5">
                    <Lock size={10} /> Voorkennis
                  </p>
                  {prereqs.length === 0 ? (
                    <p className="text-xs italic text-muted">
                      Geen voorkennis nodig
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {prereqs.map((p) => {
                        const PIcon = p!.icon;
                        return (
                          <button
                            key={p!.id}
                            onClick={() => setSelectedId(p!.id)}
                            className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-rule-2 hover:bg-paper-2 hover:border-ink transition-colors"
                          >
                            {PIcon && <PIcon size={11} />}
                            {p!.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Unlocks */}
                <div>
                  <p className="text-label text-muted mb-3 inline-flex items-center gap-1.5">
                    <Unlock size={10} /> Volgende stap
                  </p>
                  {unlocks.length === 0 ? (
                    <p className="text-xs italic text-muted">
                      Eindstation — De Meester
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {unlocks.map((u) => {
                        const UIcon = u!.icon;
                        return (
                          <button
                            key={u!.id}
                            onClick={() => setSelectedId(u!.id)}
                            className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-honey/15 hover:bg-honey/25 transition-colors border border-honey/30"
                            style={{ color: "#A57F2E" }}
                          >
                            {UIcon && <UIcon size={11} />}
                            {u!.label}
                            <ArrowRight size={11} />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Children (moons of a planet, or planets of the sun) */}
            {children.length > 0 && (
              <div className="rule-t pt-5 mb-5">
                <p className="text-label text-muted mb-3">
                  {selected.kind === "sun" ? "Planeten" : "Manen"} ·{" "}
                  {String(children.length).padStart(2, "0")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {children.map((child) => {
                    const ChildIcon = child.icon;
                    return (
                      <button
                        key={child.id}
                        onClick={() => setSelectedId(child.id)}
                        className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-rule-2 hover:bg-paper-2 hover:border-ink transition-colors"
                      >
                        {ChildIcon && <ChildIcon size={11} />}
                        {child.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {selected.href && (
              <div className="rule-t pt-5 flex items-center justify-end">
                <Link
                  href={selected.href}
                  className="group inline-flex items-center gap-2 bg-ink text-paper px-5 py-2.5 rounded-full text-sm font-medium hover:bg-ink-2 transition-all hover:pr-6"
                >
                  <span>Open pagina</span>
                  <ArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

/* ─── SIDEBAR NAV ────────────────────────────────── */

function SidebarNav({
  open,
  onClose,
  onNavigate,
  selectedId,
}: {
  open: boolean;
  onClose: () => void;
  onNavigate: (id: string) => void;
  selectedId: string | null;
}) {
  const groups = getGroupedNavigation();

  return (
    <>
      {/* backdrop */}
      {open && (
        <div
          className="absolute inset-0 z-30 backdrop-blur-sm"
          style={{ backgroundColor: "rgba(10, 7, 4, 0.4)" }}
          onClick={onClose}
        />
      )}
      <aside
        className={`absolute top-0 right-0 bottom-0 z-40 w-[320px] md:w-[380px] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          backgroundColor: "rgba(18, 12, 7, 0.98)",
          borderLeft: "1px solid rgba(245, 240, 230, 0.1)",
        }}
      >
        <div className="p-6 md:p-8 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-label mb-1" style={{ color: "#E4B866" }}>
                Index
              </p>
              <h3
                className="font-display text-2xl"
                style={{ color: "#F5F0E6" }}
              >
                Alle pagina&apos;s
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 inline-flex items-center justify-center rounded-full transition-colors"
              style={{
                color: "#F5F0E6",
                border: "1px solid rgba(245, 240, 230, 0.15)",
              }}
            >
              <X size={14} />
            </button>
          </div>

          <nav className="space-y-8">
            {groups.map((group) => (
              <div key={group.label}>
                <h4
                  className="text-label mb-3 pb-2"
                  style={{
                    color: "#E4B866",
                    borderBottom: "1px solid rgba(245, 240, 230, 0.1)",
                  }}
                >
                  {group.label}
                </h4>
                <ul className="space-y-1">
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;
                    const isActive = selectedId === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => onNavigate(item.id)}
                          className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left"
                          style={{
                            color: "#F5F0E6",
                            backgroundColor: isActive
                              ? "rgba(228, 184, 102, 0.12)"
                              : "transparent",
                          }}
                          onMouseEnter={(e) =>
                            !isActive &&
                            (e.currentTarget.style.backgroundColor =
                              "rgba(245, 240, 230, 0.06)")
                          }
                          onMouseLeave={(e) =>
                            !isActive &&
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                        >
                          {ItemIcon && (
                            <ItemIcon
                              size={15}
                              strokeWidth={1.6}
                              style={{ color: isActive ? "#E4B866" : "#F5F0E6", opacity: 0.85 }}
                            />
                          )}
                          <div className="flex-1">
                            <div className="font-display text-sm">
                              {item.label}
                            </div>
                            {item.meta && (
                              <div
                                className="text-[10px] mt-0.5"
                                style={{ color: "#F5F0E6", opacity: 0.5 }}
                              >
                                {item.meta}
                              </div>
                            )}
                          </div>
                        </button>

                        {/* List children inline for planets */}
                        {getChildren(item.id).length > 0 && (
                          <ul className="ml-7 mt-1 space-y-0.5 border-l pl-3" style={{ borderColor: "rgba(245, 240, 230, 0.08)" }}>
                            {getChildren(item.id).map((child) => {
                              const ChildIcon = child.icon;
                              const isChildActive = selectedId === child.id;
                              return (
                                <li key={child.id}>
                                  <button
                                    onClick={() => onNavigate(child.id)}
                                    className="group w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs transition-colors"
                                    style={{
                                      color: "#F5F0E6",
                                      opacity: isChildActive ? 1 : 0.7,
                                      backgroundColor: isChildActive
                                        ? "rgba(228, 184, 102, 0.1)"
                                        : "transparent",
                                    }}
                                    onMouseEnter={(e) =>
                                      !isChildActive &&
                                      (e.currentTarget.style.backgroundColor =
                                        "rgba(245, 240, 230, 0.05)")
                                    }
                                    onMouseLeave={(e) =>
                                      !isChildActive &&
                                      (e.currentTarget.style.backgroundColor =
                                        "transparent")
                                    }
                                  >
                                    {ChildIcon && (
                                      <ChildIcon size={11} strokeWidth={1.6} />
                                    )}
                                    <span>{child.label}</span>
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          <div
            className="mt-10 pt-5 text-label-mono text-xs"
            style={{
              color: "#F5F0E6",
              opacity: 0.4,
              borderTop: "1px solid rgba(245, 240, 230, 0.08)",
            }}
          >
            <span className="numerals">{String(BODIES.length).padStart(2, "0")}</span>{" "}
            hemellichamen in kaart
          </div>
        </div>
      </aside>
    </>
  );
}

function LoadingScreen() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className="flex items-center gap-3 text-label"
        style={{ color: "#F5F0E6", opacity: 0.6 }}
      >
        <Hex size={16} className="text-honey animate-pulse" filled />
        Zonnestelsel laden...
      </div>
    </div>
  );
}

function kindLabel(kind: string): string {
  return (
    { sun: "De zon", planet: "Planeet", moon: "Maan" }[kind] ?? "Hemellichaam"
  );
}

function romanLevel(n: number): string {
  return ["", "I", "II", "III", "IV"][n] ?? String(n);
}

/* ─── SHARED BUTTONS ──────────────────────────────── */

function JourneyButton({
  j,
  onStart,
}: {
  j: JourneyPath;
  onStart: () => void;
}) {
  return (
    <button
      onClick={onStart}
      className="group w-full text-left p-3 rounded-lg transition-colors"
      style={{
        color: "#F5F0E6",
        backgroundColor: "rgba(245, 240, 230, 0.04)",
        border: "1px solid rgba(245, 240, 230, 0.08)",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.backgroundColor = "rgba(0, 166, 214, 0.18)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.backgroundColor = "rgba(245, 240, 230, 0.04)")
      }
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="font-display text-sm leading-tight">{j.title}</span>
        <Play
          size={11}
          className="mt-0.5 shrink-0 transition-transform group-hover:scale-110"
          style={{ color: "#00A6D6" }}
        />
      </div>
      <div
        className="text-[10px] numerals tracking-wider"
        style={{ color: "#F5F0E6", opacity: 0.55 }}
      >
        {j.subtitle}
      </div>
    </button>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      style={{ color: "#F5F0E6" }}
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
