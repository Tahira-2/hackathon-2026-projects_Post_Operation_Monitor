# SKILLS.md

Custom skills available for agents working on the **we-care** project.

---

## `supabase-schema`

Scaffold Supabase migrations, RLS policies, and TypeScript type generation for a given feature.

**Use when:** adding a new table, updating schema, or setting up row-level security.

**Produces:**

- SQL migration file under `backend/supabase/migrations/`
- RLS policies for the affected tables
- TypeScript types synced from schema

---

## `gemini-feature`

Add a Google Gemini API integration following project conventions.

**Use when:** implementing any AI feature — text generation, summarization, classification, chat.

**Produces:**

- Service module with prompt construction, streaming support, and error handling
- Separation of prompt logic from API call (SOLID)
- Entry in `responsible-ai.md` for the new feature

---

## `component`

Generate a React component following project conventions (Vite + React + TypeScript + TailwindCSS).

**Use when:** creating a new UI component.

**Produces:**

- Component file with props typed via TypeScript interface
- Logic in a separate hook or service (no business logic in component body)
- TailwindCSS for styling, no inline styles

---

## `tdd-task`

Run a full TDD cycle for a single task: test → implement → verify → commit.

**Use when:** implementing any backend or frontend unit of work.

**Produces:**

- Test file written first
- Implementation satisfying tests
- Conventional commit per task (`feat:`, `fix:`, etc.)

---

## `responsible-ai-update`

Append documentation for a new AI feature to `projects/we-care/responsible-ai.md`.

**Use when:** any Gemini API feature is added, modified, or removed.

**Produces:**

- New section covering: data inputs, model used, prompt design, bias risks, failure cases, mitigation steps
