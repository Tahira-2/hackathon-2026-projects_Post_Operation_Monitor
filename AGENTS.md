# AGENTS.md

Guidance for AI agents (any framework) working in this repository.

## Project Context

CareDevi AI Innovation Hackathon 2026 — team project **we-care**.  
Product: **RefAI** — AI-powered referral management portal.  
Hard cutoff: **Sunday April 26, 2026 at 4:00 PM CDT**. No extensions.

## Working Directory

All team code lives under `projects/we-care/`. Do not modify other directories.

```
projects/we-care/
├── README.md            # Required — problem, solution, tech stack, setup, team credits
├── responsible-ai.md    # Required — data sources, model choices, bias, failure cases
├── frontend/            # Vite + React + TypeScript + TailwindCSS
├── backend/             # Node.js + TypeScript
└── demo/                # Demo video or screenshots
```

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

## Required Deliverables

All four must exist before the hard cutoff:

1. `projects/we-care/README.md`
2. `projects/we-care/responsible-ai.md`
3. Working demo (live or recorded, 3 minutes max)
4. Meaningful git commit history showing incremental progress

## Scoring Priorities

Optimize design and implementation decisions in this order:

1. **Real-world impact (25%)** — clinical relevance, addresses actual healthcare pain point
2. **UX (15%)** — usable by clinicians or patients, accessible, workflow-appropriate
3. **Technical innovation (15%)** — novel AI/ML use, clean architecture
4. **Presentation (10%)** — working product demo over slides
5. **Feasibility (5%)** — realistic scope, regulatory awareness

## Workflow

For every feature or change:

1. Clarify requirements — ask if unclear before writing code
2. Chunk into tasks
3. Before implementing — scan existing code for reusable components, hooks, utilities, and logic. Never duplicate what already exists. If similar code appears more than once, extract it first
4. For each task: write test → implement → verify → commit → next task
5. Update `responsible-ai.md` when AI features are added or changed

DRY applies to everything — components, pages, hooks, validators, API calls, constants, types. If you write it twice, extract it.

## Component Design

Think before writing JSX. Decompose first, code second.

### Decompose before you code

Look at the design and identify every distinct visual unit. Ask for each:
- Does it repeat? → must be a component
- Does it have internal state or logic? → must be a component
- Is it used in more than one place now, or likely to be? → must be a component
- Does the parent become hard to read without extracting it? → must be a component

### Specific rules

**Layouts are components.** Sidebar, topbar, page shell — each is its own component. Pages render inside layouts via `<Outlet />`. Never inline layout markup inside a page.

**Nav items are components.** If sidebar or topbar renders a list of nav links, each link is a `NavItem` component. The list is driven by a data array, not repeated JSX.

**Cards are components.** If a section renders multiple similar cards (stat cards, patient cards, referral cards), extract a typed `Card` or `StatCard` component. The parent maps over data and renders the component — no duplicated card markup.

**Tables are compound components.** A table is not one big `<table>` block. Decompose it:
- `Table` — wraps `<table>`, handles container and border styles
- `TableHeader` — column definitions driven by a config array, not repeated `<th>` elements
- `TableRow` — receives one typed data object as prop, renders all cells for that row
- Status badges, urgency badges → each a typed component with a variant map (`PENDING` → orange, etc.)

**Never repeat JSX.** If you write the same structure twice — even with different props — stop and extract it. Two copies means the logic is wrong, not that a component is unnecessary.

**Data drives rendering.** Mock data, table columns, nav items, tab labels — define them as typed arrays/objects at the top of the file or in a constants file. Never hardcode values inline inside `.map()` or repeated renders.

**Props over variants inline.** Different appearances (urgency: HIGH/ELEVATED/ROUTINE, status: PENDING/ACCEPTED/etc.) must be expressed as a `variant` or typed union prop with a lookup map — never as conditional className strings scattered through JSX.

**Component size limit.** If a component's JSX exceeds ~60 lines, it is doing too much. Split it.

## Coding Practices

- SOLID principles; separate logic from UI components
- Follow test-driven development
- Do not commit `.env` files or secrets
- Do not use deprecated code
- Write Dry code
- use tailwind provided class instead of custom
- Create reusable, extensible components — always extend native HTML element props (e.g. `ButtonHTMLAttributes`, `InputHTMLAttributes`) so consumers can pass any native attribute without extra wiring
- write test cases for logics and verify

## Commit Guidelines

- Use Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`
- One reason per commit. If you edited a file for two separate reasons, that is two commits
- Moving or renaming a file is its own commit — never mix a move with a content change
- Never bundle unrelated changes into one commit even if they touch the same file
- Subject line must describe the specific change — no vague messages like "update file" or "fix stuff"
- No `Co-Authored-By:` AI attribution
- Commit after every completed task, not at the end of a session
- When adding a file to a folder that contains `.gitkeep`, delete the `.gitkeep` file in a separate commit before or after adding the new file
