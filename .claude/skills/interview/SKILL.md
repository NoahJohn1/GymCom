---
name: interview
description: Plan GymCom feature updates by interviewing the user, then write an implementation-ready plan to prd.md
---

You are helping the user plan updates to their GymCom app. Your job is to conduct a thorough interview, then write an implementation-ready plan to `prd.md`.

## When to invoke

Invoke this skill automatically whenever the user mentions:
- Planning new features or updates
- Changes they want to make to the app
- Ideas for improvements
- "What should I work on next" style questions

Also invoked explicitly via `/interview`.

## Two planning documents

- **`prd.md`** — implementation-ready, phased specs for features the user has decided to work on. This is what this skill writes to.
- **`future_plans.md`** — informal idea dump / backlog of future possibilities. Ideas that aren't being scheduled yet live here instead.

## Step 1 — Gather update ideas

Use the `AskUserQuestion` tool to ask the user what updates they have in mind. Frame it broadly so they can list multiple ideas:

> "What updates are you planning for the app? List as many ideas as you have — we'll flesh each one out."

## Step 2 — Interview each idea

For each idea the user provides, use `AskUserQuestion` to ask targeted follow-up questions until you have enough detail to write an unambiguous implementation spec. Ask about:

- **UX behavior**: What exactly does the user see/tap/experience? What is the before and after?
- **Edge cases**: What happens if the list is empty, the value is zero, the user cancels mid-flow?
- **Affected components**: Which screens, tabs, or components are involved?
- **Data / state changes**: Does this require new state fields, new AsyncStorage keys, or new context actions?
- **Constraints**: Any design token, pattern, or architectural rules from CLAUDE.md that apply?

Ask one `AskUserQuestion` call per ambiguous area. Keep drilling until you have no open questions.

## Step 3 — Write the plan to prd.md

Once all ideas are fully understood, **append a new phase** to `prd.md` (or create the file if it doesn't exist).

### prd.md format

```
# GymCom — Product Requirements

## Phase N: [Theme of this batch of updates] [IN PROGRESS]

### N.1 — [Update title]

[2-4 sentence description of the problem or missing feature]

**Changes:**
- `ComponentName.tsx`: specific change
- `OtherFile.tsx`: specific change

### N.2 — [Update title]

...

---

## Files Changed in Phase N

- `path/to/file.tsx` — description of what changes
- `path/to/other.tsx` — description of what changes
```

**Phase numbering:** Read the existing `prd.md` to find the highest phase number used, then increment by 1. If the file is empty or has no phases, start at Phase 1.

**One sub-section per update idea.** Be specific — reference exact component names, prop names, state variable names, and hook names from the codebase where known.

## Step 4 — Confirm

After writing the file, tell the user:
- How many updates were captured
- The phase number assigned
- That `prd.md` has been saved and is ready for implementation
