import { db } from "@/lib/db";
import { placeAstronauts } from "@/components/atlas/graph";
import AtlasView from "./AtlasView";

export const dynamic = "force-dynamic";

export default async function AtlasPage() {
  // Load every student + their skill profile so we can place astronauts on the
  // course planets they're currently working on.
  const students = await db.user.findMany({
    where: { role: "STUDENT" },
    select: { id: true, name: true },
    orderBy: { createdAt: "asc" },
  });

  const profiles = await db.skillProfile.findMany({
    select: {
      studentId: true,
      proficiency: true,
      skill: { select: { slug: true } },
    },
  });

  const astronauts = placeAstronauts(
    students,
    profiles.map((p) => ({
      studentId: p.studentId,
      skillSlug: p.skill.slug,
      proficiency: p.proficiency,
    })),
  );

  return <AtlasView astronauts={astronauts} />;
}
