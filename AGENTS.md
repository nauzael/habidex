<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan

## Project Structure

```
hoteles/
├── .specify/                    # Spec Kit SDD: constitution, templates, scripts
├── .opencode/commands/          # OpenCode slash commands (speckit.* + gem-team skills)
├── specs/                       # Features SDD: spec, plan, tasks, contracts
├── src/                         # Código fuente
│   ├── components/              # Componentes UI
│   ├── services/                # Lógica de negocio
│   └── utils/                   # Utilidades
├── tests/                       # Tests (unit, integration, e2e)
├── docs/                        # Documentación
│   ├── plan/                    # Planes de orquestación gem-team
│   ├── architecture/            # Documentación arquitectónica
│   └── api/                     # Documentación de APIs
├── scripts/                     # Scripts del proyecto
├── config/                      # Configuración (.env.example)
├── types/                       # Definiciones de tipos
├── assets/                      # Assets estáticos
├── .gem-team.yaml               # Config del orquestador
├── AGENTS.md                    # Contexto para agentes AI
├── context_envelope.json        # Bridge de contexto
└── .gitignore
```

## Gem-Team Integration

### Phase 0: Context Loading
Cuando gem-team inicia, carga contexto desde los artifacts de Spec Kit:
- `.specify/memory/constitution.md` → conventions, constraints, prior_decisions
- `specs/*/spec.md` → task intent, research_digest.domain_context
- `specs/*/data-model.md` → architecture_snapshot

### Phase 1: Route
gem-team reconoce proyectos Spec Kit por la presencia de `.specify/`. La ruta por defecto es el flujo SDD.

### Phase 2: Plan Ingestion
El plan de Spec Kit (`specs/*/plan.md`) alimenta a gem-planner:
- `tech_stack` → contexto tecnológico
- `architecture` → architecture_snapshot
- `risks` → open_questions
Los tasks (`specs/*/tasks.md`) se convierten en el DAG de waves.

### Phase 3: Task Execution
Los tasks se distribuyen a agentes gem-team por wave:

| Spec Kit Command | gem-team Agent | Fase |
|---|---|---|
| `/speckit.constitution` | gem-researcher | Contexto inicial |
| `/speckit.specify` | gem-researcher | Especificación |
| `/speckit.clarify` | gem-researcher | Refinamiento |
| `/speckit.plan` | gem-planner | Plan técnico |
| `/speckit.tasks` | gem-planner | Descomposición |
| `/speckit.implement` | gem-implementer | Implementación |
| `/speckit.converge` | gem-reviewer | Verificación |
| `/speckit.analyze` | gem-reviewer | Consistencia |
| `/speckit.checklist` | gem-reviewer | Calidad |
| `/speckit.taskstoissues` | gem-documentation-writer | Exportación |

### Phase 4: Output
gem-team produce `context_envelope.json` sintetizado desde los artifacts de Spec Kit via el context bridge script (`.specify/scripts/powershell/update-context-bridge.ps1`).

### Artifact Mapping
| Artifact Spec Kit | Ruta | Uso en gem-team |
|---|---|---|
| Constitution | `.specify/memory/constitution.md` | Phase 0 context |
| Spec | `specs/<feature>/spec.md` | Task intent |
| Plan | `specs/<feature>/plan.md` | Phase 2 input |
| Tasks | `specs/<feature>/tasks.md` | Wave DAG |
| Data Model | `specs/<feature>/data-model.md` | Architecture snapshot |
| Contracts | `specs/<feature>/contracts/` | API contracts |
| Context Envelope | `context_envelope.json` | Contexto entre fases |
<!-- SPECKIT END -->
