# MEMORY.md

Persistent project context for agents. Update as decisions are made or change.

---

## Project Identity

- **Project:** RefAI — AI Referral Management Portal
- **Team:** We Care (Arjun Giri, Anil)
- **Event:** CareDevi AI Innovation Hackathon 2026
- **Hard cutoff:** Sunday April 26, 2026 at 4:00 PM CDT — no extensions
- **Working directory:** `projects/we-care/`

---

## Tech Decisions

| Decision | Choice | Reason |
| --- | --- | --- |
| Frontend framework | Vite + React + TypeScript | — |
| Styling | TailwindCSS | — |
| State management | Zustand | — |
| Data fetching | Axios + TanStack Query | — |
| Backend | Node.js + TypeScript | — |
| Database + Auth | Supabase (PostgreSQL) | — |
| AI | Google Gemini API | Free tier, strong structured extraction |
| Design tooling | Claude, Google Stitch | — |
| Containerization | Docker | — |

---

## Architecture Decisions

_Log significant architectural choices here as they are made._

| Decision | Choice | Reason |
| --- | --- | --- |
| | | |

---

## Known Constraints

- Patient data privacy must be respected — no real PHI in dev/test
- `responsible-ai.md` must be updated whenever an AI feature changes
- `.env` files must never be committed

---

## Open Questions

_Track unresolved decisions here. Remove when resolved._

- Demo format (live vs recorded) not decided

---

## Completed Milestones

- [x] Problem statement defined — AI referral management portal (RefAI)
- [x] `projects/we-care/README.md` created
- [x] `projects/we-care/responsible-ai.md` created
- [ ] Frontend scaffolded
- [ ] Backend scaffolded
- [ ] Docker setup complete
- [ ] Demo recorded/prepared
