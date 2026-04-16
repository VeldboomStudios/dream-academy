/**
 * Dream Academy — Solar System Atlas
 *
 * Hierarchy:
 *   Sun (core)
 *   └── Gateway planet (Login)
 *   └── Curriculum belt (8 course planets)
 *        └── Gym badge moons (1 per course)
 *   └── Role planets (Docent, Student)
 *        └── Moons (features)
 *   └── Dwarf planet (Community)
 */

import type { LucideIcon } from "lucide-react";
import {
  Sparkles,
  Award,
  Wrench,
  Cpu,
  Rocket,
  Leaf,
  Globe,
  Crown,
  Sprout,
  Code,
  Medal,
  Trophy,
} from "lucide-react";

export type BodyKind = "sun" | "planet" | "moon";

export interface SolarBody {
  id: string;
  label: string;
  kind: BodyKind;
  parentId?: string; // for moons, the planet they orbit
  orbitalRadius?: number; // distance from parent (undefined for sun)
  orbitalPeriod?: number; // seconds for full orbit
  orbitalOffset?: number; // starting angle in radians (0 - 2π)
  orbitalInclination?: number; // radians tilt
  size: number; // body radius
  color: string;
  glowColor?: string;
  icon?: LucideIcon;
  description: string;
  href?: string | null;
  meta?: string; // optional small descriptor (e.g. "Niveau 1 · 4 weken")
  badgeShape?: "hex" | "sphere"; // moons can be hex-shaped (badges) or round

  // Curriculum progression
  level?: number; // 1-4, used for orbit grouping AND journey logic
  prereqs?: string[]; // course ids that unlock this one
  unlocks?: string[]; // course ids this unlocks (computed bidirectionally)

  // Maps a course-planet body id to the DB course slug (e.g. "de-eerste-lijn").
  // Only set on the eight curriculum planets.
  courseSlug?: string;
}

/* ────────────────────────────────────────────────────
 * SYSTEM LAYOUT
 * Radii increase outward in a readable pattern.
 * ──────────────────────────────────────────────────── */

// The curriculum belt orbits the sun at 4 concentric levels.
// Astronauts (students) traverse these orbits as they complete courses.
const R = {
  curriculum: {
    l1: 3.6,
    l2: 4.9,
    l3: 6.2,
    l4: 7.6,
  },
};

const PERIOD = {
  curriculum: 90,
  moon: 14,
};

export const BODIES: SolarBody[] = [
  // ═══════════════════════════════════════════════════
  // THE SUN — Dream Academy core
  // ═══════════════════════════════════════════════════
  {
    id: "core",
    label: "Dream Academy",
    kind: "sun",
    size: 1.2,
    color: "#FFD278",
    glowColor: "#E4B866",
    icon: Sparkles,
    description:
      "De kern. Van idee naar fysiek product. AI-ondersteund curriculum geworteld in Amsterdam Zuidoost.",
    href: "/",
    meta: "De kern van het systeem",
  },

  // ═══════════════════════════════════════════════════
  // CURRICULUM BELT — 8 course planets
  // Grouped by level, increasing orbital radius per level
  // ═══════════════════════════════════════════════════
  // Level 1 — instap, geen voorkennis
  {
    id: "eerste-lijn",
    label: "De Eerste Lijn",
    kind: "planet",
    level: 1,
    prereqs: [],
    orbitalRadius: R.curriculum.l1,
    orbitalPeriod: PERIOD.curriculum,
    orbitalOffset: 0,
    orbitalInclination: 0.08,
    size: 0.38,
    color: "#E55A3D",
    icon: Code,
    description:
      "Niveau 1 · Programmeren. Je leert Python vanaf nul en bouwt een programma dat een echt probleem oplost.",
    meta: "Niveau 1 · 4 weken",
    courseSlug: "de-eerste-lijn",
    href: "/courses/de-eerste-lijn",
  },
  {
    id: "dromer",
    label: "De Dromer",
    kind: "planet",
    level: 1,
    prereqs: [],
    orbitalRadius: R.curriculum.l1,
    orbitalPeriod: PERIOD.curriculum,
    orbitalOffset: Math.PI,
    orbitalInclination: -0.08,
    size: 0.38,
    color: "#5B8470",
    icon: Sprout,
    description:
      "Niveau 1 · Solarpunk Design Thinking. Van idee naar concept, met schetsen en pitch.",
    meta: "Niveau 1 · 4 weken",
    courseSlug: "de-dromer",
    href: "/courses/de-dromer",
  },

  // Level 2 — vaardigheden, kies je specialisatie
  {
    id: "architect",
    label: "De Architect",
    kind: "planet",
    level: 2,
    prereqs: ["eerste-lijn", "dromer"],
    orbitalRadius: R.curriculum.l2,
    orbitalPeriod: PERIOD.curriculum * 1.2,
    orbitalOffset: Math.PI * 0.3,
    orbitalInclination: 0.1,
    size: 0.45,
    color: "#4A7AA8",
    icon: Cpu,
    description:
      "Niveau 2 · 3D Modelleren. Van mesh tot print-ready ontwerp, inclusief Design for Manufacturing.",
    meta: "Niveau 2 · 8 weken",
    courseSlug: "de-architect",
    href: "/courses/de-architect",
  },
  {
    id: "maker",
    label: "De Maker",
    kind: "planet",
    level: 2,
    prereqs: ["eerste-lijn", "dromer"],
    orbitalRadius: R.curriculum.l2,
    orbitalPeriod: PERIOD.curriculum * 1.2,
    orbitalOffset: Math.PI * 1.0,
    orbitalInclination: -0.05,
    size: 0.46,
    color: "#E4B866",
    icon: Wrench,
    description:
      "Niveau 2 · 3D Printen. Bedien printers, selecteer materialen, werk prints af.",
    meta: "Niveau 2 · 8 weken",
    courseSlug: "de-maker",
    href: "/courses/de-maker",
  },
  {
    id: "roboticus",
    label: "De Roboticus",
    kind: "planet",
    level: 2,
    prereqs: ["eerste-lijn"],
    orbitalRadius: R.curriculum.l2,
    orbitalPeriod: PERIOD.curriculum * 1.2,
    orbitalOffset: Math.PI * 1.7,
    orbitalInclination: 0.12,
    size: 0.45,
    color: "#B85A9E",
    icon: Rocket,
    description:
      "Niveau 2 · Robotica. Arduino, sensoren en actuators in een zelf-ontworpen 3D-geprinte behuizing.",
    meta: "Niveau 2 · 8 weken",
    courseSlug: "de-roboticus",
    href: "/courses/de-roboticus",
  },

  // Level 3 — meesterschap
  {
    id: "natuur",
    label: "De Natuur-Ingenieur",
    kind: "planet",
    level: 3,
    prereqs: ["architect"],
    orbitalRadius: R.curriculum.l3,
    orbitalPeriod: PERIOD.curriculum * 1.5,
    orbitalOffset: Math.PI * 0.5,
    orbitalInclination: -0.15,
    size: 0.50,
    color: "#68A07B",
    icon: Leaf,
    description:
      "Niveau 3 · Biomimicry. Observeer de natuur, abstraheer principes, valideer met simulatie.",
    meta: "Niveau 3 · 12 weken",
    courseSlug: "de-natuur-ingenieur",
    href: "/courses/de-natuur-ingenieur",
  },
  {
    id: "wereldbouwer",
    label: "De Wereldbouwer",
    kind: "planet",
    level: 3,
    prereqs: ["maker"],
    orbitalRadius: R.curriculum.l3,
    orbitalPeriod: PERIOD.curriculum * 1.5,
    orbitalOffset: Math.PI * 1.5,
    orbitalInclination: 0.1,
    size: 0.50,
    color: "#8E6EBE",
    icon: Globe,
    description:
      "Niveau 3 · Game Development & Digital Twins. Bouw een speelbare wereld of interactieve ervaring.",
    meta: "Niveau 3 · 12 weken",
    courseSlug: "de-wereldbouwer",
    href: "/courses/de-wereldbouwer",
  },

  // Level 4 — Capstone (de doorwinterde maker)
  {
    id: "meester",
    label: "De Meester",
    kind: "planet",
    level: 4,
    prereqs: ["natuur", "wereldbouwer", "roboticus"],
    orbitalRadius: R.curriculum.l4,
    orbitalPeriod: PERIOD.curriculum * 1.8,
    orbitalOffset: 0,
    orbitalInclination: 0.18,
    size: 0.60,
    color: "#D4A24C",
    glowColor: "#FFD278",
    icon: Crown,
    description:
      "Niveau 4 · Capstone. Integreer alles. Bouw, presenteer, mentor. Het finale project.",
    meta: "Niveau 4 · 12 weken",
    courseSlug: "de-meester",
    href: "/courses/de-meester",
  },
];

/* ────────────────────────────────────────────────────
 * MOONS — orbit specific planets
 * Curriculum planets each have 1 gym-badge moon (hex)
 * Role planets have feature moons
 * ──────────────────────────────────────────────────── */

const courseBadges: Array<{ id: string; parent: string; label: string; tier: "bronze" | "silver" | "gold" }> = [
  { id: "badge-eerste-lijn", parent: "eerste-lijn", label: "Eerste Lijn Badge", tier: "bronze" },
  { id: "badge-dromer", parent: "dromer", label: "Dromer Badge", tier: "bronze" },
  { id: "badge-architect", parent: "architect", label: "Architect Badge", tier: "silver" },
  { id: "badge-maker", parent: "maker", label: "Maker Badge", tier: "silver" },
  { id: "badge-roboticus", parent: "roboticus", label: "Roboticus Badge", tier: "silver" },
  { id: "badge-natuur", parent: "natuur", label: "Natuur Badge", tier: "gold" },
  { id: "badge-wereldbouwer", parent: "wereldbouwer", label: "Wereldbouwer Badge", tier: "gold" },
  { id: "badge-meester", parent: "meester", label: "Meester Badge", tier: "gold" },
];

const TIER_COLOR = {
  bronze: "#C08454",
  silver: "#D8DBE2",
  gold: "#E4B866",
};

const TIER_META = {
  bronze: "Brons · Cursus afgerond",
  silver: "Zilver · Capstone excellentie",
  gold: "Goud · Community bijdrage",
};

for (const b of courseBadges) {
  const parent = BODIES.find((x) => x.id === b.parent);
  const parentSize = parent?.size ?? 0.45;
  BODIES.push({
    id: b.id,
    label: b.label,
    kind: "moon",
    parentId: b.parent,
    orbitalRadius: parentSize * 1.9,
    orbitalPeriod: PERIOD.moon,
    orbitalOffset: Math.random() * Math.PI * 2,
    size: 0.09,
    color: TIER_COLOR[b.tier],
    icon: b.tier === "gold" ? Trophy : b.tier === "silver" ? Medal : Award,
    description: `Fysieke 3D-geprinte gym badge met Bijlmer honingraatgeometrie. ${TIER_META[b.tier]}.`,
    href: "/student",
    meta: TIER_META[b.tier],
    badgeShape: "hex",
  });
}

// Compute reverse links: unlocks = inverse of prereqs
for (const body of BODIES) {
  if (!body.prereqs) continue;
  for (const reqId of body.prereqs) {
    const req = BODIES.find((b) => b.id === reqId);
    if (req) {
      req.unlocks = req.unlocks ? [...req.unlocks, body.id] : [body.id];
    }
  }
}

export const BODY_BY_ID = new Map(BODIES.map((b) => [b.id, b]));

/** Lookup a course-planet body by its DB slug (e.g. "de-eerste-lijn"). */
export const BODY_BY_COURSE_SLUG = new Map(
  BODIES.filter((b) => !!b.courseSlug).map((b) => [b.courseSlug!, b])
);

/* ────────────────────────────────────────────────────
 * JOURNEY PATHS — guided tours through the curriculum
 * ──────────────────────────────────────────────────── */

export interface JourneyPath {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  stops: string[]; // body ids in order
}

export const JOURNEYS: JourneyPath[] = [
  {
    id: "designer",
    title: "De Doorgewinterde Designer",
    subtitle: "Pad: ontwerp → simulatie → meesterschap",
    description:
      "Begin bij verbeelding, leer modelleren, valideer met de natuur, integreer alles in een capstone.",
    stops: ["dromer", "architect", "natuur", "meester"],
  },
  {
    id: "developer",
    title: "De Doorgewinterde Developer",
    subtitle: "Pad: code → werelden bouwen → meesterschap",
    description:
      "Schrijf je eerste code, leer fabriceren, bouw interactieve werelden, integreer alles.",
    stops: ["eerste-lijn", "maker", "wereldbouwer", "meester"],
  },
  {
    id: "robotmaker",
    title: "De Robotbouwer",
    subtitle: "Pad: code → robotica → meesterschap",
    description:
      "Code-fundament, hardware-integratie, eindproject met fysieke en digitale onderdelen.",
    stops: ["eerste-lijn", "roboticus", "meester"],
  },
];

/* ────────────────────────────────────────────────────
 * HELPERS
 * ──────────────────────────────────────────────────── */

export function getChildren(parentId: string): SolarBody[] {
  return BODIES.filter((b) => b.parentId === parentId);
}

export function getPlanets(): SolarBody[] {
  return BODIES.filter((b) => b.kind === "planet");
}

export function getGroupedNavigation() {
  return [
    {
      label: "Curriculum · Planeten",
      items: BODIES.filter(
        (b) =>
          b.kind === "planet" &&
          [
            "eerste-lijn",
            "dromer",
            "architect",
            "maker",
            "roboticus",
            "natuur",
            "wereldbouwer",
            "meester",
          ].includes(b.id)
      ),
    },
  ];
}

/* ────────────────────────────────────────────────────
 * ASTRONAUTS — students traveling the curriculum
 * Maps skill slugs to the course planet they belong to,
 * so we can derive where each student is currently working.
 * ──────────────────────────────────────────────────── */

/** Skill slug → course planet id mapping. Used to locate astronauts. */
export const SKILL_TO_COURSE: Record<string, string> = {
  // Niveau 1
  python: "eerste-lijn",
  "variables-loops": "eerste-lijn",
  debugging: "eerste-lijn",
  "design-thinking": "dromer",
  sketching: "dromer",
  pitching: "dromer",
  // Niveau 2
  "3d-modeling": "architect",
  dfm: "architect",
  "stl-export": "architect",
  slicer: "maker",
  "printer-ops": "maker",
  "post-processing": "maker",
  arduino: "roboticus",
  sensors: "roboticus",
  circuits: "roboticus",
  // Niveau 3
  biomimicry: "natuur",
  simulation: "natuur",
  "material-science": "natuur",
  "game-dev": "wereldbouwer",
  "unreal-engine": "wereldbouwer",
  "digital-twin": "wereldbouwer",
  // Niveau 4
  "project-management": "meester",
  documentation: "meester",
  mentoring: "meester",
};

export interface AstronautPlacement {
  studentId: string;
  name: string;
  avatarInitial: string;
  /** Hex color derived from student id so each astronaut is visually distinct. */
  color: string;
  /** Course planet id where the astronaut currently sits. */
  currentCourseId: string;
  /** Optional next planet — if set, the astronaut is in transit. */
  targetCourseId?: string;
  /** 0..1 along the transit path. Ignored if targetCourseId is undefined. */
  transitProgress?: number;
  /** Average proficiency on the current course's skills (0..100). */
  mastery: number;
}

/**
 * Derive astronaut placements from raw skill profiles.
 * Inputs are plain data so this can run on server or client.
 */
export function placeAstronauts(
  students: Array<{ id: string; name: string }>,
  profiles: Array<{ studentId: string; skillSlug: string; proficiency: number }>,
): AstronautPlacement[] {
  // Group course proficiency per student: studentId -> courseId -> {sum, count}
  const perStudent = new Map<
    string,
    Map<string, { sum: number; count: number }>
  >();

  for (const p of profiles) {
    const courseId = SKILL_TO_COURSE[p.skillSlug];
    if (!courseId) continue;
    let byCourse = perStudent.get(p.studentId);
    if (!byCourse) {
      byCourse = new Map();
      perStudent.set(p.studentId, byCourse);
    }
    const cur = byCourse.get(courseId) ?? { sum: 0, count: 0 };
    cur.sum += p.proficiency;
    cur.count += 1;
    byCourse.set(courseId, cur);
  }

  const placements: AstronautPlacement[] = [];
  for (const s of students) {
    const byCourse = perStudent.get(s.id);
    // Default to Niveau 1 gateway planet if we have no data
    if (!byCourse || byCourse.size === 0) {
      placements.push({
        studentId: s.id,
        name: s.name,
        avatarInitial: s.name.charAt(0).toUpperCase(),
        color: hashColor(s.id),
        currentCourseId: "eerste-lijn",
        mastery: 0,
      });
      continue;
    }

    // Rank courses by average proficiency
    const ranked = Array.from(byCourse.entries())
      .map(([id, v]) => ({ id, avg: v.sum / v.count }))
      .sort((a, b) => b.avg - a.avg);

    const top = ranked[0];
    // If top course is mastered, look at what it unlocks — astronaut is in transit
    let targetId: string | undefined;
    let progress: number | undefined;
    if (top.avg >= 70) {
      const topBody = BODIES.find((b) => b.id === top.id);
      const nextId = topBody?.unlocks?.[0];
      if (nextId) {
        targetId = nextId;
        // Progress from 70→100 maps to 0→1 along the transit
        progress = Math.min(1, Math.max(0, (top.avg - 70) / 30));
      }
    }

    placements.push({
      studentId: s.id,
      name: s.name,
      avatarInitial: s.name.charAt(0).toUpperCase(),
      color: hashColor(s.id),
      currentCourseId: top.id,
      targetCourseId: targetId,
      transitProgress: progress,
      mastery: Math.round(top.avg),
    });
  }

  return placements;
}

/** Stable warm hue per id — astronauts feel like a crew, not random neon. */
function hashColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 33 + seed.charCodeAt(i)) & 0xffffff;
  }
  // Warm palette — honey, terracotta, sage, coral, violet-plum, ochre
  const palette = [
    "#E4B866", // honey
    "#C06442", // terracotta
    "#8AB097", // sage
    "#D27AA8", // coral
    "#A487C8", // plum
    "#D27856", // warm rust
    "#6A8AA8", // dusty blue
    "#E9C46A", // ochre
  ];
  return palette[h % palette.length];
}
