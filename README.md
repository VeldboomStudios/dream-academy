# Dream Academy

AI-ondersteund educatieplatform voor libraries, scholen en universiteiten.

- **Voor docenten:** Live AI-inzichten over je klas — wie loopt vast, wie excelleert, waar zit het patroon
- **Voor studenten:** Peer-matching — vind een klasgenoot die jou kan helpen, of iemand die jij kan helpen
- **Voor instellingen:** 8 kant-en-klare cursussen, gym badge systeem, digitaal portfolio, meertalig

## Stack

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS v4
- Neon Postgres + Prisma 7
- Anthropic Claude API (insight engine)
- JWT session auth (jose)
- Vercel deployment

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy env template
cp .env.example .env.local
# Fill in DATABASE_URL (from Neon), ANTHROPIC_API_KEY, AUTH_SECRET

# 3. Push schema to Neon
npm run db:push

# 4. Seed demo data (8 courses, demo institution, 6 students)
npm run db:seed

# 5. Run dev server
npm run dev
```

Visit <http://localhost:3000>.

## Demo accounts

- **Teacher:** `teacher@dream.academy` / `teacher123`
- **Students:** `ahmed@demo.nl`, `layla@demo.nl`, `jamal@demo.nl`, etc. / `student123`

## How AI insights work

Click **Genereer AI-inzichten** on the teacher dashboard. The system:

1. Builds a snapshot of the class (students, check-ins, submissions, skill profiles)
2. Sends it to Claude Sonnet 4.6 with a structured prompt
3. Parses back 3-6 prioritized insights: stuck students, excelling students, class-wide patterns, pair recommendations
4. Also runs the peer-matching algorithm: for every struggling student, finds classmates who mastered that skill

The included demo seed creates realistic scenarios:

- **Ahmed** is struggling with Python loops (and said so in his check-in)
- **Fatima** is a Python ace
- **Layla** excels at 3D modeling but struggles with Python
- **Jamal** is balanced — good printer ops
- ...

Generate insights and watch the AI pair them up.

## Structure

```
src/
  app/
    page.tsx              # Landing
    auth/login/           # Login
    teacher/              # Teacher dashboard
    student/              # Student dashboard
    courses/              # Public course catalog
    api/
      auth/               # login, logout
      teacher/            # generate-insights
      student/            # checkin, peer-match contact
  lib/
    db.ts                 # Prisma + Neon adapter
    auth.ts               # JWT session helpers
    anthropic.ts          # Claude client
    insights.ts           # AI insight engine + peer matching
prisma/
  schema.prisma           # Full data model
  seed.ts                 # 8 courses + demo institution
```

## Next steps

See `PLAN.md` for the full product roadmap (MVP → Phase 2 → Phase 3).

- Multi-tenancy (currently single demo institution)
- Parent portal
- Real-time SSE updates on teacher dashboard
- Mobile app
- Integration with 3D printer farms (OctoPrint, Bambu Connect)
- Marketplace for student designs
- Corporate workshop booking

## Built by

Veldboom Studios · Amsterdam Zuidoost
Based on the How to Dream Academy curriculum.
