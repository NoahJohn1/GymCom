---
name: push-changes
description: After completing any code change, commit all changes on a new sub-branch and push to GitHub
---

After completing any code change, this skill updates documentation, creates a new sub-branch off the current branch, commits all changes, and pushes to GitHub.

## When to invoke

Invoke this skill automatically after completing:
- Any feature implementation
- Any bug fix
- Any refactor or code improvement

Also invoked explicitly via `/push-changes`.

## Step 1 — Update documentation

Review what was changed and update docs as needed. Do **not** update files that were not affected.

- **`CLAUDE.md`**: Add or update entries in Component Notes, Key Patterns, Architecture, or Runtime Requirements if:
  - A new component was created
  - A new pattern was introduced
  - A new utility or helper was added
  - An existing component's props, behavior, or usage changed significantly

- **`.claude/skills/*/SKILL.md`** (skill files): Update any skill whose instructions reference changed behavior (e.g., if dependency-check constraints changed).

- **`README.md`**: Update only if it exists and public-facing behavior or setup instructions changed.

## Step 2 — Determine current branch

Run:
```
git branch --show-current
```

Note the result as `<source-branch>`.

## Step 3 — Create a new sub-branch

Generate a branch name using this format:
```
claude/<kebab-case-description>-<6-char-random-id>
```

Where:
- `<kebab-case-description>` is a short (2-4 word) summary of what was implemented, e.g. `rest-timer-fix`, `workout-log-screen`, `exercise-search-ui`
- `<6-char-random-id>` is a random alphanumeric string to avoid collisions

Create and switch to the branch:
```
git checkout -b claude/<description>-<id>
```

## Step 4 — Stage and commit

Stage all changes:
```
git add -A
```

Commit with a descriptive message that summarizes what was implemented:
```
git commit -m "<summary of changes>"
```

The commit message should be one clear sentence describing the change (e.g. "Add workout log screen with set tracking and AsyncStorage persistence").

## Step 5 — Push to GitHub

Push the new branch:
```
git push -u origin claude/<description>-<id>
```

**Retry policy:** If the push fails due to a network error, retry up to 4 times with exponential backoff:
- Wait 2s, retry
- Wait 4s, retry
- Wait 8s, retry
- Wait 16s, retry

Do **not** retry if the failure is a 403 (permission error) or branch naming issue — report the error to the user instead.

## Step 6 — Report to user

After a successful push, tell the user:
- The branch name that was created and pushed
- A summary of which documentation files were updated (if any)
- The commit message used
