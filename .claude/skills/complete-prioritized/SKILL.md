---
name: complete-prioritized
description: Read all Prioritized issues from the GymCom project board, implement each one, then push all changes on a new branch
---

Reads all open issues in the "Prioritized" column of the GymCom Project board, implements each one, then calls `/push-changes` to commit and push all changes on a new branch.

## When to invoke

Invoke this skill automatically whenever the user:
- Says "work on prioritized", "complete the board", "do the prioritized tickets", "ship the prioritized items", or similar
- Asks Claude to start working through the backlog or project board

Also invoked explicitly via `/complete-prioritized`.

## Step 1 — Fetch Prioritized issues

Use the GitHub GraphQL API to get all items with Status = "Prioritized" from the GymCom Project:

```
gh api graphql -f query='
{
  node(id: "PVT_kwHOCbPJes4BSEkp") {
    ... on ProjectV2 {
      items(first: 50) {
        nodes {
          id
          fieldValues(first: 10) {
            nodes {
              ... on ProjectV2ItemFieldSingleSelectValue {
                name
                field { ... on ProjectV2SingleSelectField { name } }
              }
            }
          }
          content {
            ... on Issue {
              number
              title
              body
              url
            }
          }
        }
      }
    }
  }
}'
```

Filter the results to items where the Status field value name = **"Prioritized"**. For each, extract: issue number, title, body (contains Goal, Details, Technical Notes), and URL.

If there are no Prioritized issues, report this to the user and stop.

## Step 2 — Orient

Read `CLAUDE.md` silently before touching any code. Understand the app architecture, design patterns, existing components, and conventions that must be followed.

## Step 3 — Implement each ticket

Work through each Prioritized issue **one at a time**:

1. Parse the issue body to extract Goal, Details, and Technical Notes.
2. Read all files that will be affected before editing any of them.
3. Implement the change following all patterns in `CLAUDE.md` (design tokens, useColors hook, SafeAreaView wrapping, Ionicons only, etc.).
4. Move on to the next ticket.

**Do not commit between tickets** — accumulate all changes across the full set.

If a ticket is too ambiguous or requires information not present in the issue, skip it and note it in the final report. Do not block on unclear tickets.

## Step 4 — Invoke /push-changes

After all tickets have been implemented (or attempted), invoke the `/push-changes` skill. It will:
- Update `CLAUDE.md` if new components, patterns, or state actions were introduced
- Create a new sub-branch (`claude/<description>-<id>`)
- Commit all changes with a descriptive message
- Push to GitHub

## Step 5 — Report

After `/push-changes` completes, summarize:

- **Implemented** — list of ticket titles + issue numbers
- **Skipped** — list of any tickets that were skipped, with a brief reason for each
- **Branch** — the branch name created and pushed by `/push-changes`
