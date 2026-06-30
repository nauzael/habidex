---
description: "Orquestar flujo completo Spec Kit → gem-team: constitution → specify → plan → tasks → implement"
argument-hint: "<feature description>"
effort: max
tools:
  read: true
  write: true
  edit: true
  bash: true
  agent: true
  skill: true
  question: true
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding. This command orchestrates the full Spec Kit pipeline and delegates implementation to gem-team agents.

## Outline

### 1. Validate Feature Description

If `$ARGUMENTS` is empty, ERROR: "No feature description provided. Usage: /speckit-to-gem-team <feature description>"

### 2. Bootstrap Constitution (if missing)

Check if `.specify/memory/constitution.md` exists:
- **If missing**: Run `/speckit.constitution` with the project context to create it.
  - Read project README, existing configs, and infer project name/domain.
  - Execute constitution creation per speckit.constitution workflow.
  - Verify the file was created at `.specify/memory/constitution.md`.
- **If exists**: Read it and note existing principles for downstream phases.

### 3. Execute Spec Kit Pipeline

Execute these commands **sequentially** (each depends on the previous):

#### 3a. `/speckit.specify "<feature description>"`

Create the feature specification:
- Uses the feature description from `$ARGUMENTS`
- Generates spec.md under `specs/<N>-<short-name>/`
- Validates specification quality
- Capture the `SPECIFY_FEATURE_DIRECTORY` from completion report

**If user provides explicit args via $ARGUMENTS (like a direct spec path or an explicit SPECIFY_FEATURE_DIRECTORY):** Pass them through to speckit.specify. The command already supports environment-variable-level overrides (e.g. `SPECIFY_FEATURE_DIRECTORY`, `GIT_BRANCH_NAME`).

#### 3b. `/speckit.plan`

Execute the implementation planning workflow:
- Reads the spec created in step 3a
- Generates plan.md, data-model.md, contracts/, research.md, quickstart.md
- Runs extension hooks (before_plan, after_plan)
- Capture `FEATURE_DIR` from the completion report

#### 3c. `/speckit.tasks`

Generate the task breakdown:
- Reads plan.md from step 3b
- Generates tasks.md with phases, user stories, and dependency graph
- Identifies [P] parallel tasks
- Capture tasks.md path

### 4. Update Agent Context

Run `/speckit.agent-context.update` so the SPECKIT section in AGENTS.md points at the latest plan.

### 5. Deploy Context Bridge

Run `.specify/scripts/powershell/update-context-bridge.ps1` to generate/update `context_envelope.json` with the latest Spec Kit artifacts.

### 6. Dispatch to gem-team Agents

Read the generated `tasks.md` and delegate implementation:

**Phase 3a — Setup & Foundation (Wave 1)**:
- Map Setup tasks (Phase 1 in tasks.md) to agent: `gem-implementer`
- Map Foundational tasks (Phase 2) to agent: `gem-implementer`
- Execute sequentially (foundational blocks setup)

**Phase 3b — User Stories by Priority (Waves 2-N)**:
- For each User Story phase in tasks.md:
  - Identify [P] (parallel) tasks → dispatch concurrently to `gem-implementer`
  - Identify sequential tasks → execute in dependency order
  - After each story completes, run `/speckit.converge` for verification

**Phase 3c — Polish & Cross-Cutting (Final Wave)**:
- Map Polish phase tasks to `gem-implementer`
- Run `/speckit.analyze` for consistency audit
- Run `/speckit.checklist` for quality gates

### 7. Finalize

- Run the context bridge script to refresh `context_envelope.json` post-implementation
- Report completion with links to:
  - `SPECIFY_FEATURE_DIRECTORY` — the feature directory
  - `specs/<feature>/spec.md` — the specification
  - `specs/<feature>/plan.md` — the plan
  - `specs/<feature>/tasks.md` — the task breakdown
  - Summary of waves executed and gem-team agents used

## Agent Mapping (from .gem-team.yaml)

| Spec Kit Command | gem-team Agent | Phase |
|---|---|---|
| /speckit.constitution | gem-researcher | Contexto inicial |
| /speckit.specify | gem-researcher | Especificación |
| /speckit.clarify | gem-researcher | Refinamiento |
| /speckit.plan | gem-planner | Plan técnico |
| /speckit.tasks | gem-planner | Descomposición |
| /speckit.implement | gem-implementer | Implementación |
| /speckit.converge | gem-reviewer | Verificación |
| /speckit.analyze | gem-reviewer | Consistencia |
| /speckit.checklist | gem-reviewer | Calidad |
| /speckit.taskstoissues | gem-documentation-writer | Exportación |

## Common Edge Cases

- **Constitution missing and no context available**: Ask user for project name and key principles before proceeding.
- **specify command fails**: Check the error output — if hook-related, try with `--skip-hooks`; if prereq-related, run `.specify/scripts/powershell/check-prerequisites.ps1` to diagnose.
- **tasks.md has no [P] markers**: Execute all tasks sequentially; no parallel optimization possible.
- **No gem-team.yaml found**: Report warning and run tasks via speckit.implement directly as fallback.
- **Feature directory already exists from a previous run**: speckit.specify handles this by auto-incrementing; acknowledge the new directory path.
- **Context bridge script missing**: Skip step 5 with a warning; the pipeline can proceed without context_envelope.json.
