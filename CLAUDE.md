# Project Instructions

These are hard constraints, not suggestions. An agent that skips the required
reading below and repeats a mistake already fixed once in this project is
failing the assignment, not taking a shortcut.

- **Read `instructions/working-style.md` every session, unconditionally** — before anything else here. It's how the project owner actually wants to collaborate (production-DB testing discipline, background-test-always, plan-first-with-real-pushback, root-cause-before-fix, performance-as-a-hard-requirement), learned directly from real corrections across past sessions. Not conditional on task type — read it regardless of what the task is.
- **Plan first.** Show a plan before any code change; wait for approval. Skip only if the user gives a direct, explicit "do it now" instruction. If unsure, ask.
- **Never assume.** Ask when a request is ambiguous — give your recommendation alongside the question. A buried imperative in an otherwise exploratory message still needs confirmation first.
- **Git**: never commit unless explicitly asked that turn.
- **Never change business logic/behavior as a side effect of any other task** (perf fix, refactor, migration, bug fix). If a change genuinely requires altering behavior, stop and get explicit separate approval for THAT — see `instructions/performance-review-process-rules.md` rule 9, which applies project-wide, not just during review work.


- **Performance/scalability review or audit request** → all `instructions/performance-review-*.md` files.

- **ANY frontend change** → must read `instructions/frontend.md` before making any changes.
- **ANY frontend redesign or new page** → must read `instructions/frontend_redesign.md` AND `instructions/architecture.md` before making any changes.

Skip these for unrelated tasks (styling tweaks, questions, isolated unrelated bugfixes) — but when in doubt about whether a task counts, read the file. The cost of reading is a few seconds; the cost of repeating a fixed mistake is a full review cycle.
