---
name: i
description: Deep-dive interview that relentlessly asks questions until every detail of the task is fully understood. Will not stop asking until all ambiguity is eliminated.
---

## Summary
Use the AskUserQuestionTool to remove ALL ambiguity with the prompt. Be **relentless** — do not stop after one or two rounds. Keep drilling deeper, asking follow-ups, and probing edge cases until you have a complete, unambiguous picture of the task.

## Core Behavior: Never Stop Too Early
- Ask questions ONE AT A TIME using AskUserQuestion so the user can focus on each answer.
- After each answer, evaluate: "Do I now have EVERYTHING I need to implement this perfectly on the first try?" If the answer is no, ask another question.
- Cover ALL of these dimensions before stopping:
  - **What** exactly needs to happen (functional requirements)
  - **Why** this is needed (context, motivation, business reason)
  - **Where** in the codebase this lives (files, projects, layers)
  - **How** it should behave in edge cases and error scenarios
  - **Who** is affected (users, systems, downstream consumers)
  - **Acceptance criteria** — how do we know it's done?
  - **Out of scope** — what should this NOT do?
- If an answer raises new questions or implies complexity, follow that thread immediately.
- If an answer is vague, push back and ask for specifics. Do not accept hand-wavy answers.
- Track what you've learned and what gaps remain. Explicitly state what you still need to know.

## Question Strategy
1. Start broad: understand the goal and context
2. Narrow down: get into specifics, implementation details, constraints
3. Probe edges: error handling, edge cases, "what if X happens?"
4. Validate assumptions: repeat back your understanding and ask if it's correct
5. Final sweep: ask about anything you haven't covered

## Closing Sequence
After you believe all questions have been answered:
1. Summarize your complete understanding of the task in a concise bullet list.
2. Ask: **"Here's my understanding of the full task. Is anything wrong, missing, or incomplete?"**
3. If the user corrects or adds anything, follow up on those additions with more questions if needed.
4. End with one final AskUserQuestion: **"Is there anything else you'd like to add or any extra requirements that came to mind?"**
5. Only proceed to implementation after this final question is answered.

## Special case
- If the prompt mentions anything about a plan document or prd file then read the document or file and interview me in detail using the AskUserQuestionTool about literally anything: technical implementation, UI & UX, concerns, tradeoffs, etc. Really go deep in this case.
- This special planning interview should begin by explicitly telling the user that we are about to go deep on the plan document by using its name if applicable.
