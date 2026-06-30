---
description: "Convertir plan.md de Spec Kit a contexto de gem-planner"
argument-hint: ""
effort: low
tools:
  read: true
  write: true
  bash: true
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty). Optional: pass an explicit feature directory path as argument. Otherwise auto-detect the most recent plan.md.

## Outline

### 1. Locate Plan File

**Resolution order for plan file:**
1. If `$ARGUMENTS` is a path to a `plan.md` or a feature directory, use it directly.
2. If `.specify/feature.json` exists, read `feature_directory` and resolve `specs/<feature_directory>/plan.md`.
3. Otherwise, run: `Get-ChildItem -Path "specs/*/plan.md" | Sort-Object LastWriteTime -Descending | Select-Object -First 1` and use the most recent.
4. If no plan.md found: ERROR "No plan.md found under specs/. Run /speckit.plan first."

### 2. Extract Key Sections

Read the identified `plan.md` and extract:

**tech_stack**: Find the technology choices section. Extract:
- Languages, frameworks, libraries with versions
- Database, cache, messaging systems
- Infrastructure / deployment targets

Format as JSON-compatible array:
```json
[
  {
    "name": "<tech>",
    "version": "<version if specified>",
    "usage_context": "<how it is used>"
  }
]
```

**architecture**: Find the architecture/design section. Extract:
- Architectural patterns (layered, microservices, event-driven, etc.)
- Component structure
- Data flow description
- Key integration points

Format as structured text with key:value pairs for easy ingestion.

**risks**: Find the risks/open-questions section. Extract:
- All identified risks with mitigation strategies
- Open questions and unknowns
- Dependencies on external systems

Format as JSON array:
```json
[
  {
    "risk": "<description>",
    "impact": "<high/medium/low>",
    "mitigation": "<strategy or 'none'>"
  }
]
```

### 3. Produce gem-planner Context

Generate a structured context block suitable for gem-planner ingestion:

```markdown
## gem-planner Context (from Spec Kit plan.md)

**Source**: `<path-to-plan.md>`

### Tech Stack

| Technology | Version | Usage |
|------------|---------|-------|
| <name> | <version> | <context> |

### Architecture

```
<architecture summary>
```

### Risks & Open Questions

| Risk | Impact | Mitigation |
|------|--------|------------|
| <risk> | <impact> | <mitigation> |
```

### 4. Output

Write the context to:
- `.specify/gem-planner-context.md` — formatted context file for gem-planner consumption
- Append to `context_envelope.json` if it exists (update `tech_stack`, `architecture_snapshot`, and `research_digest.open_questions` fields)

Report to user:
- Plan file used
- Tech stack entries extracted
- Risk items identified
- Output: `.specify/gem-planner-context.md`

## Common Edge Cases

- **plan.md has no explicit tech_stack section**: Infer tech from codebase (check package.json, requirements.txt, Cargo.toml, etc.) and mark as [INFERRED].
- **plan.md has no risks section**: Report "No risks documented" and produce empty risk array.
- **Multiple plan.md files exist**: Use the most recently modified; report the full path so user can override with explicit argument.
- **Context envelope missing**: Skip append step; write only gem-planner-context.md.
- **Empty plan.md sections**: Report which sections were empty so user can update the plan.
