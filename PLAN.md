# Dream Academy — Product Plan

**Vision:** Standalone AI-powered education platform for libraries, schools, and universities to run maker/tech education programs with intelligent teacher insights and peer-learning.

**Status:** Greenfield — scaffolding now (April 16, 2026)

---

## What This Is

A software platform that turns the **How to Dream Academy curriculum** into a plug-and-play system any educational institution can deploy. Two primary users:

1. **Students** — follow courses, submit work, see AI-suggested peers who can help them
2. **Teachers / Coaches** — see a live dashboard of class progress with AI insights on who needs attention, who's excelling, and who to pair together

**Not tied to OBA Next.** OBA Next was our MVP / proof-of-concept. Dream Academy is the productized version.

---

## Core Problem We're Solving

Teachers in maker/tech education lose track of where each student is. They can't see:
- Who's struggling vs. excelling on a specific skill
- Which students could help which other students
- Where someone is stuck before it becomes dropout
- What the class-level patterns are (is the whole cohort stuck on the same concept?)

Current tools (Google Classroom, Canvas, Moodle) are built for traditional education — lectures + quizzes. They don't work for project-based maker learning where progress is messy, non-linear, and peer-driven.

---

## Key Differentiators

1. **AI co-teacher** — Live insights on each student's state, suggestions for intervention
2. **Peer matching engine** — Automatically suggests "Student A can help Student B with X"
3. **Project-based by default** — Built around capstones, not quizzes
4. **Maker-aware** — Tracks physical outputs (prints, prototypes, builds), not just digital submissions
5. **Multilingual** — NL/EN/Sranang Tongo/Arabic/Turkish (via AI translation)
6. **Gym badge gamification** — Gamified progression native, not bolted on
7. **Library/school/university-ready** — Multi-tenant, role-based, deployable per institution

---

## Target Customers

| Tier | Who | What They Pay For |
|------|-----|-------------------|
| **Libraries** | OBA, Koninklijke Bibliotheek, municipal libraries | Per-location license + hosted |
| **Schools (VO/MBO)** | Zuidoost schools, PCC Alkmaar (GreenKart), TUMO partners | Per-classroom license |
| **Universities / HBO** | Design academies, engineering programs | Per-department license |
| **Community centers** | Vivell jeugdcentra, Burgeracademie | Low-cost / subsidized tier |

---

## MVP Scope (Phase 1 — 4-6 weeks)

### Must-Have
- [ ] Auth (teacher, student, admin roles)
- [ ] Course catalog (seed with 8 How to Dream Academy courses)
- [ ] Student enrollment + dashboard
- [ ] Student check-ins (daily/weekly mood + progress)
- [ ] Project submissions (photos, videos, files)
- [ ] Teacher dashboard with class overview
- [ ] AI insight engine (Claude API) — teacher suggestions
- [ ] Peer matching engine — student-to-student suggestions
- [ ] Gym badge system (digital + 3D print-ready STL)

### Nice-to-Have (Phase 2)
- [ ] Parent/guardian portal
- [ ] Multi-tenant (multiple institutions)
- [ ] Buurt Munt / tokenomics integration
- [ ] Real-time notifications (push)
- [ ] Mobile app
- [ ] Integration with 3D printer farms (OctoPrint, Bambu Connect)

### Phase 3
- [ ] Marketplace (student designs)
- [ ] Corporate workshop booking
- [ ] Analytics exports for grant reporting
- [ ] White-label theming per institution

---

## Tech Stack

Same as OBA Next (proven, fast to build):

- **Frontend:** Next.js 16 (App Router) + Tailwind v4 + shadcn/ui
- **Database:** Neon Postgres + Prisma 7 (@prisma/adapter-neon)
- **AI:** Anthropic SDK (Claude Sonnet 4.6 for most, Opus for complex analysis)
- **Auth:** NextAuth.js (or Clerk if we go faster)
- **Storage:** Vercel Blob for file uploads (photos/videos)
- **Deployment:** Vercel
- **Real-time:** Server-Sent Events (SSE) for live dashboard updates
- **Monorepo:** Single Next.js app for now, can split later

---

## Data Model (v0 — Prisma Schema)

```
Institution (tenant)
  └── Users (students, teachers, admins)
  └── Classes
       └── Enrollments (Student ↔ Class)
       └── Courses (per Class, from catalog)
            └── Modules
                 └── Assignments
                      └── Submissions (Student's work)
                      └── Checkins (mood, progress, blockers)

Skill (tag) — used for peer matching
SkillProfile (Student's strength/struggle per skill)

Insight (AI-generated, per student or per class)
PeerSuggestion (AI-generated pair recommendations)
Badge (earned by student on module/course completion)
```

---

## AI Insight Engine — Core Logic

### For Teachers
Every ~15 minutes, the system runs a Claude call per active class with:
- Student check-ins (last 7 days)
- Submission quality/velocity
- Skill profile updates
- Attendance patterns

Output: 3-5 prioritized insights per class:
- "Ahmed hasn't submitted in 5 days — usually consistent. Check in?"
- "Layla excelled at wall-thickness today — could she demo to the class tomorrow?"
- "The whole cohort is stuck on exporting STL files. Consider a 10-min workshop."
- "Jamal and Nadia both struggle with Python loops. Pair them with Fatima (mastered last week)?"

### For Students
When a student logs in, system checks:
- What they're stuck on (from latest submission + checkin)
- Which classmates have mastered that skill recently

Output: "**Jamal** is great at 3D modeling overhangs — message him?" with a one-click intro button.

---

## Peer Matching Algorithm (v0 — simple)

1. For each student, compute `SkillProfile` = { skill_id → proficiency_score (0-100) }
2. When Student A has a low score on skill X:
   - Find classmates with high score on skill X (≥70) who were active in last 7 days
   - Rank by: (a) proficiency, (b) willingness (they've opted in to mentor), (c) distance (same class > same school > same institution)
3. Present top 3 as suggestions
4. Track outcomes (did they connect? did A improve?)

Iterate to embeddings-based matching in Phase 2.

---

## Seeded Courses (v0)

All 8 from the How to Dream Academy:

| # | Course | Level | Duration | Capstone |
|---|--------|-------|----------|----------|
| 1 | De Eerste Lijn | 1 | 4 wkn | Eigen werkend programma |
| 2 | De Dromer | 1 | 4 wkn | Projectconcept + pitch |
| 3 | De Architect | 2 | 8 wkn | Print-ready 3D ontwerp |
| 4 | De Maker | 2 | 8 wkn | Functioneel geprint object |
| 5 | De Roboticus | 2 | 8 wkn | Werkende robot |
| 6 | De Natuur-Ingenieur | 3 | 12 wkn | Biomimicry product |
| 7 | De Wereldbouwer | 3 | 12 wkn | Game of digital twin |
| 8 | De Meester | 4 | 12 wkn | Integratieproject |

Each seeded with 4-6 modules, example assignments, and skill tags.

---

## Next Steps (This Session)

1. Scaffold Next.js 16 + Tailwind + Prisma
2. Write Prisma schema
3. Write seed script with all 8 courses
4. Build teacher dashboard skeleton
5. Build student dashboard skeleton
6. Build AI insight API route
7. Write README + deploy instructions

---

## Roadmap After MVP

- **Month 2:** Deploy to 3 pilot institutions (Vivell, one school, one library)
- **Month 3:** Gather feedback, iterate on AI prompts
- **Month 4:** Multi-tenancy, parent portal
- **Month 6:** Launch marketplace, mobile app
- **Month 12:** 20+ institutions, self-serve signup, revenue-positive

---

## Success Metrics

- **Teacher time saved:** 3-5 hrs/week per class (surveys)
- **Peer connection rate:** 30%+ of suggestions acted on
- **Student retention:** 85%+ course completion (vs. ~60% industry baseline)
- **Badges awarded:** 10+ per student per semester
- **NPS:** 50+ from teachers, 40+ from students
