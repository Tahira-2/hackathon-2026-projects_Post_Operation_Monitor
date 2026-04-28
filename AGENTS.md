# AGENTS.md

> Read this file completely before touching any code. These rules apply to every task, every file, every commit — no exceptions.

---

## Project Context

**Event:** CareDevi AI Innovation Hackathon 2026  
**Team:** we-care  
**Product:** RefAI — AI-powered referral management portal  
**Hard cutoff:** Sunday, April 26, 2026 at 4:00 PM CDT. No extensions.

---

## Working Directory

All code lives under `projects/we-care/`. Never touch anything outside it.

```
projects/we-care/
├── README.md              # Problem, solution, tech stack, setup, team credits
├── responsible-ai.md      # Data sources, model choices, bias, failure cases
├── frontend/              # Vite + React + TypeScript + TailwindCSS
├── backend/               # Node.js + TypeScript
└── demo/                  # Demo video or screenshots
```

Both `README.md` and `responsible-ai.md` are **required deliverables** — keep them updated as the project evolves.

---

## Tech Stack

| Layer           | Technology                                                           |
| --------------- | -------------------------------------------------------------------- |
| Package manager | pnpm                                                                 |
| Frontend        | Vite, React, TypeScript, TailwindCSS, Zustand, Axios, TanStack Query |
| Backend         | Node.js, TypeScript                                                  |
| Database        | Supabase (PostgreSQL + Auth)                                         |
| AI              | Google Gemini API                                                    |
| Design          | Claude, Google Stitch                                                |
| Orchestration   | Docker                                                               |

---

## Scoring Priorities

Every design and implementation decision must optimize in this order:

1. **Real-world impact (25%)** — clinical relevance, real healthcare pain point
2. **UX (15%)** — usable by clinicians/patients, accessible, workflow-appropriate
3. **Technical innovation (15%)** — novel AI use, clean architecture
4. **Presentation (10%)** — working demo beats slides every time
5. **Feasibility (5%)** — realistic scope, regulatory awareness

---

## Workflow — Follow This Every Time

For every feature or change, in order:

1. **Clarify** — if requirements are unclear, ask before writing code
2. **Scan first** — read existing code for reusable components, hooks, utils, types. Never duplicate what already exists
3. **Decompose** — plan component boundaries before writing JSX
4. **TDD** — write test → implement → verify → commit
5. **Update `responsible-ai.md`** — any time an AI feature is added or changed

---

## DRY — Enforced

If the same logic, structure, or markup appears more than once — stop. Extract it first, then continue.

This applies to: components, hooks, validators, API calls, constants, types, and JSX structure.

---

## Component Rules

### Decompose Before You Code

For every visible unit in the design, ask:

- Does it repeat? → **must be a component**
- Does it have internal state or logic? → **must be a component**
- Is it used (or likely to be used) in more than one place? → **must be a component**
- Does the parent become hard to read without extracting it? → **must be a component**

### Specific Rules

**Layouts are components.**  
Sidebar, topbar, page shell — each is its own component. Pages render inside layouts via `<Outlet />`. Never inline layout markup inside a page.

**Nav items are components.**  
If a sidebar or topbar renders nav links, each link is a `NavItem` component. The list is driven by a typed data array — not repeated JSX.

**Cards are components.**  
Stat cards, patient cards, referral cards — extract a typed `StatCard` or `ReferralCard` component. The parent maps over data and renders the component.

**Tables are compound components.**  
Decompose every table:

- `Table` — wraps `<table>`, handles container and border styles
- `TableHeader` — column definitions from a config array, never repeated `<th>` elements
- `TableRow` — receives one typed data object, renders all cells for that row
- Status/urgency badges → typed component with a variant map (`PENDING` → orange, `ACCEPTED` → green, etc.)

**Data drives rendering.**  
Mock data, table columns, nav items, tab labels — define them as typed arrays at the top of the file or in a constants file. Never hardcode values inline inside `.map()`.

**Props over inline variants.**  
Urgency (`HIGH` / `ELEVATED` / `ROUTINE`) and status (`PENDING` / `ACCEPTED` / etc.) must be expressed as a typed union prop with a lookup map. Never use conditional className strings scattered through JSX.

**Component size limit.**  
If a component's JSX exceeds ~60 lines, it is doing too much. Split it.

**Extend native HTML props.**  
Always extend native element attributes (`ButtonHTMLAttributes`, `InputHTMLAttributes`, etc.) so consumers can pass any native prop without extra wiring.

---

## Coding Standards

- **TypeScript strict mode** — no `any`. Use `unknown` and narrow it.
- **SOLID principles** — separate logic from UI components.
- **Tailwind only** — use Tailwind's provided classes. No custom CSS unless Tailwind cannot do it.
- **No deprecated APIs** — check before using.
- **No `.env` files committed** — ever. Use `.env.example` as the template.
- **No secrets in code** — not in comments, not in logs.
- **Write tests for all logic** — and verify they pass before committing.

### Naming

| Thing                 | Convention         | Example             |
| --------------------- | ------------------ | ------------------- |
| Variables & functions | `camelCase`        | `getReferralById`   |
| Types & Interfaces    | `PascalCase`       | `ReferralRecord`    |
| React components      | `PascalCase`       | `ReferralCard.tsx`  |
| Constants             | `UPPER_SNAKE_CASE` | `MAX_REFERRAL_AGE`  |
| Files (non-component) | `kebab-case`       | `referral-utils.ts` |

---

## Commit Rules

- Use Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`
- **One reason per commit.** Two reasons = two commits, even if it's the same file.
- **Never bundle unrelated changes** into one commit.
- Moving or renaming a file is its own commit — never mix with content changes.
- Subject line must describe the specific change. Not: `"update file"`. Yes: `"feat: add ReferralCard component with urgency variant map"`.
- Commit after every completed task — not at the end of a session.
- When adding a file to a folder with `.gitkeep`, delete `.gitkeep` in a separate commit.
- No `Co-Authored-By:` AI attribution lines.

---

## Required Deliverables Checklist

Before 4:00 PM CDT, April 26, 2026:

- [ ] `projects/we-care/README.md` — complete
- [ ] `projects/we-care/responsible-ai.md` — complete and up to date
- [ ] Working demo (live or recorded, max 3 minutes)
- [ ] Meaningful git commit history showing incremental progress

---

## When In Doubt

1. Re-read this file.
2. Check existing code for established patterns.
3. Ask before guessing — leave a `// TODO: needs clarification —` comment if blocked.
