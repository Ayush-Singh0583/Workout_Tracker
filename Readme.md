# 1. Start Postgres
docker-compose up postgres -d

# 2. Backend
cd backend
npm install
cp ../.env.example .env        # edit DATABASE_URL + JWT_SECRET
npx prisma migrate dev --name init
npm run seed                   # loads all 17 exercises + 3 PPL templates
npm run start:dev              # → http://localhost:4000

# 3. Frontend
cd ../frontend
npm install
cp ../.env.example .env.local  # set NEXT_PUBLIC_API_URL
npm run dev                    # → http://localhost:3000



What's wired up end-to-end:

JWT auth with bcrypt hashing, protected routes on every NestJS controller, client-side token storage + redirect guard
Full PPL seed — 17 exercises across Push/Pull/Legs with prescribed sets×reps baked into templates
logSetSafe() in SetService — upserts sets idempotently so re-tapping a completed set doesn't double-log
PR detection runs on every set log — checks maxWeight, maxReps, maxVolume, and estimated 1RM via Epley; upserts PersonalRecord atomically
generateOverloadSuggestion() in both backend/src/shared/progression.ts and frontend/lib/progression.ts — double-progression model (reps first → weight), plateau detection at 3 sessions, 10% deload trigger
Recharts ProgressChart with colour-coded dots (green/yellow/red) per session status
RestTimer with circular SVG progress and vibration API on completion
Framer Motion on every list item, workout card open/close, PR flash animation, and page entry