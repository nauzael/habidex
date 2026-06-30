---
description: "Distribuir tasks.md de Spec Kit a agentes gem-team por wave"
argument-hint: ""
effort: low
tools:
  read: true
  write: true
  edit: true
  bash: true
  agent: true
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty). Optional: pass an explicit feature directory or tasks.md path as argument.

## Outline

### 1. Locate Tasks File

**Resolution order:**
1. If `$ARGUMENTS` is a path to a `tasks.md` or a feature directory, use it directly.
2. If `.specify/feature.json` exists, read `feature_directory` and resolve `specs/<feature_directory>/tasks.md`.
3. Otherwise, run: `Get-ChildItem -Path "specs/*/tasks.md" | Sort-Object LastWriteTime -Descending | Select-Object -First 1` and use the most recent.
4. If no tasks.md found: ERROR "No tasks.md found under specs/. Run /speckit.tasks first."

### 2. Parse Tasks

Read the tasks.md and parse its structure:

**Identify phases**:
```regex
^### Phase \d+:
```
Extract phase number, phase title, and all tasks within.

**Identify user stories**:
```regex
^#### User Story \d+:
```
Extract story number, title, and all associated tasks.

**Parse task entries**:
Each task has format: `- [ ] TASK_ID [P?] [STORY?] Description with path`

Extract for each task:
- `id`: e.g. T001
- `parallel`: true if `[P]` marker present
- `story`: Story label if present (e.g. US1)
- `description`: Full description text
- `file_path`: Extract file path from description (look for path-like text or parenthetical paths)
- `phase`: Phase number it belongs to

### 3. Build Execution Waves

Apply DAG building rules to produce waves:

**Wave construction algorithm:**
- Phase 1 (Setup) tasks → Wave 1, sequential order (use [P] markers for parallelization within wave)
- Phase 2 (Foundational) tasks → Wave 2, sequential order
- Phase 3+ (User Stories) tasks:
  - Group by Story label
  - If a story has no dependencies on other stories: dispatch all its [P] tasks in one wave
  - If a story depends on another story's output: delay to later wave
- Final Phase (Polish) → Final Wave
- For tasks without [P] marker within a wave: execute sequentially within that wave

**Wave output structure:**

```json
{
  "waves": [
    {
      "wave": 1,
      "label": "Setup",
      "tasks": ["T001", "T002"],
      "parallel": false,
      "agent": "gem-implementer"
    },
    {
      "wave": 2,
      "label": "User Story 1",
      "tasks": ["T003 [P]", "T004 [P]", "T005"],
      "parallel": true,
      "agent": "gem-implementer"
    }
  ]
}
```

### 4. Map Tasks to gem-team Agents

Use the `.gem-team.yaml` agent mapping:

| Task Context | Agent |
|---|---|
| Setup / Foundation / Implementation | gem-implementer |
| Tests (if identified by [TEST] or test: prefix) | gem-browser-tester |
| Documentation tasks (docs:, documentation:) | gem-documentation-writer |
| Research tasks (research:, investigate:) | gem-researcher |
| Post-execution verification | gem-reviewer |

### 5. Execute Waves

For each wave:

**If wave has `parallel: true`:**
- Dispatch all [P] tasks concurrently to their mapped gem-team agents
- Collect results as each completes
- If any task fails: log error, continue with remaining tasks, report failure at wave end

**If wave has `parallel: false`:**
- Execute tasks in list order, one by one
- Each task goes to the mapped agent
- Wait for completion before starting next task

**Agent invocation format:**
- `gem-implementer`: Execute the task as a direct implementation (read context, write code, create files)
- `gem-researcher`: Investigate and document findings
- `gem-reviewer`: Run verification/quality checks on completed work
- `gem-browser-tester`: Execute tests and report results
- `gem-documentation-writer`: Generate or update documentation

**After each wave completes:**
- Run `/speckit.converge` for the completed tasks
- If convergence fails, log and continue (report at end)

### 6. Completion Report

Report to user:
- Total waves executed
- Tasks per wave (with parallel/sequential breakdown)
- Agents used per wave
- Any failed tasks and their errors
- Convergence results per wave
- Overall status: SUCCESS / PARTIAL / FAILED

## Common Edge Cases

- **No [P] markers in tasks.md**: All waves are sequential; no parallel optimization.
- **No gem-team.yaml found**: Fall back to sequential execution via `/speckit.implement`.
- **Story dependencies not explicit in tasks.md**: Infer from phase ordering (later phases depend on earlier).
- **Task has no clear agent mapping**: Default to `gem-implementer` for implementation tasks.
- **Wave has mixed [P] and non-[P] tasks**: Execute non-[P] tasks first (sequentially), then dispatch [P] tasks in parallel.
- **Agent not available/installed**: Log warning and execute the task inline (the current agent handles it).
- **tasks.md updated during execution**: Use the parsed snapshot taken in step 2; do not re-read mid-execution.
