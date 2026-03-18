---
name: create-release
description: Create a versioned Git tag on main and push it to GitHub to trigger a release build
---

Creates a versioned Git tag on `main` and pushes it to GitHub to trigger any release pipeline configured for the repo.

## When to invoke

Only invoked explicitly via `/create-release`. Do NOT invoke this skill automatically.

## Step 1 — Get the version number

Use `AskUserQuestion` to ask the user what version to release:

> "What version tag should this release use? (e.g. v1.0.1, v1.1.0, v2.0.0)"

Free-text input. Validate that the response matches the pattern `v<major>.<minor>.<patch>` — if not, ask again.

## Step 2 — Check current branch and git state

Check the current branch:
```
git branch --show-current
```

If not on `main`, warn the user:
> "You are currently on `<branch>`, not `main`. Releases must be tagged on `main`. Switch to main first, or merge your branch before releasing."

Use `AskUserQuestion`: **I'll switch to main first — cancel for now** | **I understand, proceed anyway (tag current branch)**

If the user cancels, stop.

Check for uncommitted changes:
```
git status --short
```

If there are uncommitted changes, warn:
> "There are uncommitted changes. These will NOT be included in the release — the tag will point to the last commit. Commit and push first with `/push-changes` if you want them included."

Use `AskUserQuestion`: **Proceed anyway** | **Cancel**

If Cancel, stop.

## Step 3 — Check the tag doesn't already exist

```
git tag --list "<version>"
```

If the tag already exists locally or remotely, tell the user and stop:
> "Tag `<version>` already exists. Choose a different version number."

## Step 4 — Confirm before tagging

Use `AskUserQuestion` to confirm:

> "Ready to create and push tag `<version>` to `main` on NoahJohn1/GymCom. Proceed?"

Options: **Yes, create the release** | **Cancel**

If Cancel, stop.

## Step 5 — Create and push the tag

Create an annotated tag:
```
git tag -a <version> -m "Release <version>"
```

Push the tag to origin:
```
git push origin <version>
```

**Retry policy:** If push fails due to a network error, retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s). Do NOT retry on 403 errors — report them to the user instead.

## Step 6 — Report

After a successful push, report:

> **Release `<version>` tagged and pushed!**
>
> The tag has been pushed to GitHub.
>
> Monitor the repo:
> - **Actions:** `https://github.com/NoahJohn1/GymCom/actions`
> - **Releases:** `https://github.com/NoahJohn1/GymCom/releases`
