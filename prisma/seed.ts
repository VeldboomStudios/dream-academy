import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    "DATABASE_URL is required. Add a Neon Postgres connection string to .env.local",
  );
}
const db = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: url }),
});

async function main() {
  console.log("🌱 Seeding Dream Academy...");

  // ─── SKILLS ────────────────────────────────────────
  const skills = await Promise.all(
    [
      { slug: "python", name: "Python Programming", nameNl: "Python Programmeren", category: "coding" },
      { slug: "variables-loops", name: "Variables & Loops", nameNl: "Variabelen & Loops", category: "coding" },
      { slug: "debugging", name: "Debugging", nameNl: "Debuggen", category: "coding" },
      { slug: "design-thinking", name: "Design Thinking", nameNl: "Design Thinking", category: "design" },
      { slug: "sketching", name: "Concept Sketching", nameNl: "Concept Schetsen", category: "design" },
      { slug: "pitching", name: "Pitching Ideas", nameNl: "Ideeën Pitchen", category: "soft" },
      { slug: "3d-modeling", name: "3D Modeling", nameNl: "3D Modelleren", category: "design" },
      { slug: "dfm", name: "Design for Manufacturing", nameNl: "Design for Manufacturing", category: "fabrication" },
      { slug: "stl-export", name: "STL Export", nameNl: "STL Exporteren", category: "fabrication" },
      { slug: "slicer", name: "Slicer Software", nameNl: "Slicer Software", category: "fabrication" },
      { slug: "printer-ops", name: "3D Printer Operation", nameNl: "3D Printer Bediening", category: "fabrication" },
      { slug: "post-processing", name: "Post-Processing", nameNl: "Nabewerking", category: "fabrication" },
      { slug: "arduino", name: "Arduino / ESP32", nameNl: "Arduino / ESP32", category: "robotics" },
      { slug: "sensors", name: "Sensors & Actuators", nameNl: "Sensoren & Actuators", category: "robotics" },
      { slug: "circuits", name: "Basic Circuits", nameNl: "Basis Circuits", category: "robotics" },
      { slug: "biomimicry", name: "Biomimicry Methodology", nameNl: "Biomimicry Methodologie", category: "design" },
      { slug: "simulation", name: "Simulation & Analysis", nameNl: "Simulatie & Analyse", category: "design" },
      { slug: "material-science", name: "Material Science", nameNl: "Materiaalwetenschap", category: "fabrication" },
      { slug: "game-dev", name: "Game Development", nameNl: "Game Development", category: "coding" },
      { slug: "unreal-engine", name: "Unreal Engine", nameNl: "Unreal Engine", category: "coding" },
      { slug: "digital-twin", name: "Digital Twin Concepts", nameNl: "Digital Twin", category: "design" },
      { slug: "project-management", name: "Project Management", nameNl: "Projectmanagement", category: "soft" },
      { slug: "documentation", name: "Process Documentation", nameNl: "Procesdocumentatie", category: "soft" },
      { slug: "mentoring", name: "Mentoring Peers", nameNl: "Peers Begeleiden", category: "soft" },
    ].map((s) => db.skill.upsert({ where: { slug: s.slug }, create: s, update: s }))
  );

  const skillBy = (slug: string) => skills.find((s) => s.slug === slug)!;
  console.log(`✓ ${skills.length} skills`);

  // ─── COURSES ───────────────────────────────────────
  const courses = [
    {
      slug: "de-eerste-lijn",
      title: "The First Line",
      titleNl: "De Eerste Lijn",
      subtitle: "Programmeren — Leer je eerste werkende programma schrijven",
      level: 1,
      durationWeeks: 4,
      description:
        "Een instap in programmeren voor iedereen. Je leert Python (of Scratch voor de jongsten) en bouwt een werkend programma dat een echt probleem oplost uit jouw dagelijks leven. AI helpt je debuggen, maar jij blijft de baas.",
      prerequisites: [],
      capstoneBrief: "Een functioneel programma (min. 50 regels) dat een probleem oplost dat jij zelf hebt gedefinieerd.",
      iconEmoji: "⚡",
      colorHex: "#e63946",
      modules: [
        { title: "Hello World", skills: ["python"] },
        { title: "Variables & Loops", skills: ["python", "variables-loops"] },
        { title: "Functions & Logic", skills: ["python", "debugging"] },
        { title: "Capstone Project", skills: ["python", "debugging"] },
      ],
    },
    {
      slug: "de-dromer",
      title: "The Dreamer",
      titleNl: "De Dromer",
      subtitle: "Solarpunk Design Thinking — Van droom naar concept",
      level: 1,
      durationWeeks: 4,
      description:
        "Je leert de design thinking methodologie en ontwikkelt een eigen projectconcept binnen een Solarpunk visie. Duurzaam, gemeenschappelijk, toekomstgericht.",
      prerequisites: [],
      capstoneBrief: "Een compleet projectconcept + fysiek moodboard + 3-minuten pitch voor peers.",
      iconEmoji: "🌱",
      colorHex: "#2a9d8f",
      modules: [
        { title: "Empathize & Define", skills: ["design-thinking"] },
        { title: "Ideate & Sketch", skills: ["design-thinking", "sketching"] },
        { title: "Prototype & Test", skills: ["design-thinking"] },
        { title: "Pitch & Feedback", skills: ["pitching"] },
      ],
    },
    {
      slug: "de-architect",
      title: "The Architect",
      titleNl: "De Architect",
      subtitle: "3D Modelleren — Ontwerp voor fabricage",
      level: 2,
      durationWeeks: 8,
      description:
        "Leer 3D modelleren in professionele tools (Blender, SolidWorks for Makers, Tinkercad). Begrijp geometrie, schaal en printbaarheid.",
      prerequisites: ["de-eerste-lijn", "de-dromer"],
      capstoneBrief: "Een zelf-ontworpen 3D model, print-ready, gedocumenteerd met technische tekeningen.",
      iconEmoji: "📐",
      colorHex: "#1d3557",
      modules: [
        { title: "Mesh Basics", skills: ["3d-modeling"] },
        { title: "Parametric Design", skills: ["3d-modeling"] },
        { title: "Design for Manufacturing", skills: ["3d-modeling", "dfm"] },
        { title: "Export & Documentation", skills: ["stl-export", "documentation"] },
      ],
    },
    {
      slug: "de-maker",
      title: "The Maker",
      titleNl: "De Maker",
      subtitle: "3D Printen & Fabricage — Van file naar fysiek",
      level: 2,
      durationWeeks: 8,
      description:
        "Bedien 3D printers zelfstandig. Selecteer materialen, optimaliseer slicer settings, los printfouten op en finish je prints professioneel.",
      prerequisites: ["de-eerste-lijn", "de-dromer"],
      capstoneBrief: "Een functioneel meerdelig object — zelf ontworpen, geprint, geassembleerd, afgewerkt.",
      iconEmoji: "🔨",
      colorHex: "#e9c46a",
      modules: [
        { title: "Printer Intro", skills: ["printer-ops"] },
        { title: "Materials & Settings", skills: ["slicer", "printer-ops"] },
        { title: "Troubleshooting", skills: ["printer-ops"] },
        { title: "Post-Processing & Finishing", skills: ["post-processing"] },
      ],
    },
    {
      slug: "de-roboticus",
      title: "The Roboticist",
      titleNl: "De Roboticus",
      subtitle: "Robotica & Elektronica — Hardware ontmoet code",
      level: 2,
      durationWeeks: 8,
      description:
        "Bouw circuits met Arduino/ESP32, programmeer sensoren en actuators, ontwerp en print je eigen behuizing. Software en hardware komen samen.",
      prerequisites: ["de-eerste-lijn", "de-dromer"],
      capstoneBrief: "Werkende robot met min. 2 sensoren en 1 actuator in een zelf-ontworpen 3D-geprinte behuizing.",
      iconEmoji: "🤖",
      colorHex: "#f4a261",
      modules: [
        { title: "Arduino Fundamentals", skills: ["arduino", "circuits"] },
        { title: "Sensors", skills: ["arduino", "sensors"] },
        { title: "Actuators & Motors", skills: ["sensors", "arduino"] },
        { title: "Integration Project", skills: ["arduino", "sensors", "3d-modeling"] },
      ],
    },
    {
      slug: "de-natuur-ingenieur",
      title: "The Biomimicry Engineer",
      titleNl: "De Natuur-Ingenieur",
      subtitle: "Biomimicry — Ontwerp met de natuur als leermeester",
      level: 3,
      durationWeeks: 12,
      description:
        "Pas biomimicry-methodologie toe: observeer de natuur, abstraheer principes, pas ze toe op je ontwerp. Valideer met simulatie.",
      prerequisites: ["de-architect"],
      capstoneBrief: "Biomimicry-geïnspireerd functioneel product, gevalideerd door simulatie, gefabriceerd en getest.",
      iconEmoji: "🐝",
      colorHex: "#588157",
      modules: [
        { title: "Observing Nature", skills: ["biomimicry"] },
        { title: "Abstracting Principles", skills: ["biomimicry", "design-thinking"] },
        { title: "Simulation & Validation", skills: ["simulation", "material-science"] },
        { title: "Prototype & Test", skills: ["biomimicry", "3d-modeling"] },
      ],
    },
    {
      slug: "de-wereldbouwer",
      title: "The Worldbuilder",
      titleNl: "De Wereldbouwer",
      subtitle: "Game Development & Digital Twins",
      level: 3,
      durationWeeks: 12,
      description:
        "Bouw interactieve 3D omgevingen in Unreal Engine. Leer digital twin concepten. Publiceer een speelbare build of interactieve ervaring.",
      prerequisites: ["de-architect"],
      capstoneBrief: "Speelbaar gamelevel of interactieve digital twin, online toegankelijk.",
      iconEmoji: "🌍",
      colorHex: "#7209b7",
      modules: [
        { title: "Unreal Engine Basics", skills: ["unreal-engine", "game-dev"] },
        { title: "Interactivity", skills: ["unreal-engine", "game-dev"] },
        { title: "Digital Twins", skills: ["digital-twin", "unreal-engine"] },
        { title: "Publishing", skills: ["unreal-engine", "documentation"] },
      ],
    },
    {
      slug: "de-meester",
      title: "The Master",
      titleNl: "De Meester",
      subtitle: "Capstone — Integreer alles wat je geleerd hebt",
      level: 4,
      durationWeeks: 12,
      description:
        "Combineer vaardigheden uit meerdere disciplines in één complex project. Manage de tijdlijn, documenteer het proces, presenteer publiekelijk en mentor een nieuwkomer.",
      prerequisites: ["de-natuur-ingenieur", "de-wereldbouwer"],
      capstoneBrief: "Portfolio-waardig geïntegreerd project, publiekelijk gepresenteerd op demo day.",
      iconEmoji: "👑",
      colorHex: "#d4af37",
      modules: [
        { title: "Project Scoping", skills: ["project-management"] },
        { title: "Build & Iterate", skills: ["3d-modeling", "arduino", "unreal-engine"] },
        { title: "Mentoring & Peer Work", skills: ["mentoring"] },
        { title: "Present & Exhibit", skills: ["pitching", "documentation"] },
      ],
    },
  ];

  for (const c of courses) {
    const course = await db.course.upsert({
      where: { slug: c.slug },
      create: {
        slug: c.slug,
        title: c.title,
        titleNl: c.titleNl,
        subtitle: c.subtitle,
        level: c.level,
        durationWeeks: c.durationWeeks,
        description: c.description,
        prerequisites: JSON.stringify(c.prerequisites),
        capstoneBrief: c.capstoneBrief,
        iconEmoji: c.iconEmoji,
        colorHex: c.colorHex,
      },
      update: {
        title: c.title,
        titleNl: c.titleNl,
        subtitle: c.subtitle,
        description: c.description,
        capstoneBrief: c.capstoneBrief,
      },
    });

    // Modules
    for (let i = 0; i < c.modules.length; i++) {
      const m = c.modules[i];
      const existing = await db.module.findFirst({
        where: { courseId: course.id, order: i + 1 },
      });

      const moduleRecord = existing
        ? await db.module.update({
            where: { id: existing.id },
            data: {
              title: m.title,
              titleNl: m.title,
              description: `Module ${i + 1} of ${c.titleNl}`,
              estimatedHours: Math.ceil((c.durationWeeks * 4) / c.modules.length),
            },
          })
        : await db.module.create({
            data: {
              courseId: course.id,
              order: i + 1,
              title: m.title,
              titleNl: m.title,
              description: `Module ${i + 1} of ${c.titleNl}`,
              estimatedHours: Math.ceil((c.durationWeeks * 4) / c.modules.length),
            },
          });

      // Link skills
      for (const skillSlug of m.skills) {
        const skill = skillBy(skillSlug);
        await db.moduleSkill.upsert({
          where: { moduleId_skillId: { moduleId: moduleRecord.id, skillId: skill.id } },
          create: { moduleId: moduleRecord.id, skillId: skill.id, weight: 1 },
          update: {},
        });
      }

      // Default assignment (capstone for last module)
      const existingAssignment = await db.assignment.findFirst({
        where: { moduleId: moduleRecord.id, order: 1 },
      });
      if (!existingAssignment) {
        await db.assignment.create({
          data: {
            moduleId: moduleRecord.id,
            order: 1,
            title: `${m.title} Project`,
            titleNl: `${m.title} Project`,
            brief: i === c.modules.length - 1 ? c.capstoneBrief! : `Apply the skills from ${m.title}.`,
            type: i === c.modules.length - 1 ? "CAPSTONE" : "PROJECT",
            isCapstone: i === c.modules.length - 1,
          },
        });
      }
    }

    // Badge per course
    await db.badge.upsert({
      where: { slug: `${c.slug}-bronze` },
      create: {
        slug: `${c.slug}-bronze`,
        title: `${c.title} Badge`,
        titleNl: `${c.titleNl} Badge`,
        courseId: course.id,
        tier: "BRONZE",
        description: `Awarded for completing ${c.titleNl}.`,
      },
      update: {},
    });
  }
  console.log(`✓ ${courses.length} courses`);

  // ─── DEMO INSTITUTION + USERS ──────────────────────
  const institution = await db.institution.upsert({
    where: { slug: "demo" },
    create: {
      name: "Dream Academy Demo",
      slug: "demo",
      type: "LIBRARY",
      language: "nl",
    },
    update: {},
  });

  const teacherHash = await bcrypt.hash("teacher123", 10);
  const teacher = await db.user.upsert({
    where: { email: "teacher@dream.academy" },
    create: {
      email: "teacher@dream.academy",
      name: "Shaquille Veldboom",
      passwordHash: teacherHash,
      role: "TEACHER",
      institutionId: institution.id,
      bio: "Lead instructor, How to Dream Academy",
    },
    update: {},
  });

  const demoClass = await db.class.upsert({
    where: { id: "demo-class-1" },
    create: {
      id: "demo-class-1",
      name: "Bijlmer Makers — Lente 2026",
      description: "Pilot cohort, Zuidoost",
      institutionId: institution.id,
      startDate: new Date("2026-04-01"),
      endDate: new Date("2026-09-30"),
      teachers: { connect: [{ id: teacher.id }] },
    },
    update: {},
  });

  // Hook up first 2 courses to demo class
  const eersteLijn = await db.course.findUnique({ where: { slug: "de-eerste-lijn" } });
  const dromer = await db.course.findUnique({ where: { slug: "de-dromer" } });
  if (eersteLijn) {
    await db.classCourse.upsert({
      where: { classId_courseId: { classId: demoClass.id, courseId: eersteLijn.id } },
      create: { classId: demoClass.id, courseId: eersteLijn.id, startDate: new Date("2026-04-01") },
      update: {},
    });
  }
  if (dromer) {
    await db.classCourse.upsert({
      where: { classId_courseId: { classId: demoClass.id, courseId: dromer.id } },
      create: { classId: demoClass.id, courseId: dromer.id, startDate: new Date("2026-04-01") },
      update: {},
    });
  }

  // Demo students
  const studentData = [
    { email: "ahmed@demo.nl", name: "Ahmed Boukhari" },
    { email: "layla@demo.nl", name: "Layla Diallo" },
    { email: "jamal@demo.nl", name: "Jamal Pinas" },
    { email: "nadia@demo.nl", name: "Nadia Khourani" },
    { email: "fatima@demo.nl", name: "Fatima Asante" },
    { email: "kwame@demo.nl", name: "Kwame Owusu" },
  ];
  const studentHash = await bcrypt.hash("student123", 10);

  for (const s of studentData) {
    const student = await db.user.upsert({
      where: { email: s.email },
      create: {
        email: s.email,
        name: s.name,
        passwordHash: studentHash,
        role: "STUDENT",
        institutionId: institution.id,
      },
      update: {},
    });
    await db.enrollment.upsert({
      where: { studentId_classId: { studentId: student.id, classId: demoClass.id } },
      create: { studentId: student.id, classId: demoClass.id, status: "ACTIVE" },
      update: {},
    });
  }
  console.log(`✓ Demo institution with ${studentData.length} students`);

  // Seed some skill profiles to make peer matching interesting
  const students = await db.user.findMany({
    where: { institutionId: institution.id, role: "STUDENT" },
  });

  const skillProfiles = [
    { email: "fatima@demo.nl", skills: { python: 85, "variables-loops": 90, debugging: 80, "3d-modeling": 35 } },
    { email: "layla@demo.nl", skills: { "3d-modeling": 92, dfm: 85, "stl-export": 78, python: 40 } },
    { email: "ahmed@demo.nl", skills: { python: 30, "variables-loops": 25, debugging: 35, "3d-modeling": 50 } },
    { email: "jamal@demo.nl", skills: { "3d-modeling": 75, dfm: 60, python: 55, "printer-ops": 88 } },
    { email: "nadia@demo.nl", skills: { "design-thinking": 80, sketching: 85, pitching: 75, python: 32 } },
    { email: "kwame@demo.nl", skills: { arduino: 70, sensors: 65, circuits: 80, python: 60 } },
  ];

  for (const profile of skillProfiles) {
    const student = students.find((s) => s.email === profile.email);
    if (!student) continue;
    for (const [slug, prof] of Object.entries(profile.skills)) {
      const skill = skillBy(slug);
      await db.skillProfile.upsert({
        where: { studentId_skillId: { studentId: student.id, skillId: skill.id } },
        create: { studentId: student.id, skillId: skill.id, proficiency: prof, confidence: prof - 10 },
        update: { proficiency: prof, confidence: prof - 10 },
      });
    }
  }
  console.log(`✓ Seeded skill profiles`);

  // Sample checkins
  const ahmed = students.find((s) => s.email === "ahmed@demo.nl");
  if (ahmed) {
    await db.checkin.create({
      data: {
        studentId: ahmed.id,
        mood: 2,
        progressSelf: 30,
        blocker: "Ik snap niet hoe loops werken. Mijn code geeft steeds errors.",
        needsHelp: true,
        note: "Ik blijf vastlopen op de for-loop opdracht.",
      },
    });
  }

  const layla = students.find((s) => s.email === "layla@demo.nl");
  if (layla) {
    await db.checkin.create({
      data: {
        studentId: layla.id,
        mood: 5,
        progressSelf: 95,
        note: "3D printen is helemaal mijn ding! Kan niet wachten op De Maker.",
      },
    });
  }

  console.log("✅ Seeding complete.");
  console.log("\nLogin:");
  console.log("  teacher@dream.academy / teacher123");
  console.log("  ahmed@demo.nl / student123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
