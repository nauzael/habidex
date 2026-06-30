# 🏨 Proyecto Hoteles

Sistema de gestión hotelera desarrollado con **Spec-Driven Development (SDD)** usando **Spec Kit** y orquestado por **gem-team** en **OpenCode**.

---

## 📋 Stack

| Capa | Tecnología |
|------|-----------|
| **Metodología** | Spec-Driven Development (Spec Kit) |
| **Orquestación** | gem-team (multi-agent) |
| **AI Agent** | OpenCode + Superpowers |
| **Frontend** | *Por definir en /speckit.plan* |
| **Backend** | *Por definir en /speckit.plan* |
| **Base de datos** | *Por definir en /speckit.plan* |

---

## 📁 Estructura del Proyecto

```
hoteles/
│
├── .specify/                       # Spec Kit — motor SDD
│   ├── memory/constitution.md      # Principios del proyecto
│   ├── templates/                  # Plantillas spec/plan/tasks
│   ├── scripts/powershell/         # Automatización PowerShell
│   ├── extensions/                 # Extensiones instaladas
│   └── workflows/                  # Workflows Speckit
│
├── .opencode/
│   └── commands/                   # Slash commands speckit.* + skills gem-team
│
├── specs/                          # Features (generado por /speckit.specify)
│   └── <feature>/
│       ├── spec.md                 # Especificación funcional
│       ├── plan.md                 # Plan técnico
│       ├── tasks.md                # Desglose de tareas
│       ├── data-model.md           # Modelo de datos
│       ├── contracts/              # Contratos API
│       └── research.md             # Investigación técnica
│
├── src/                            # Código fuente
│   ├── components/                 # Componentes UI
│   ├── services/                   # Lógica de negocio
│   └── utils/                      # Utilidades
│
├── tests/                          # Tests
│   ├── unit/                       # Tests unitarios
│   ├── integration/                # Tests de integración
│   └── e2e/                        # Tests end-to-end
│
├── docs/                           # Documentación
│   ├── plan/                       # Planes de orquestación (gem-team)
│   ├── architecture/               # Documentación arquitectónica
│   └── api/                        # Documentación de APIs
│
├── scripts/                        # Scripts del proyecto
├── config/                         # Configuración
│   └── .env.example
├── types/                          # Definiciones de tipos
├── assets/                         # Assets estáticos
│
├── .gem-team.yaml                  # Config del orquestador gem-team
├── AGENTS.md                       # Contexto para agentes AI
├── context_envelope.json           # Bridge de contexto entre fases
├── .gitignore
├── README.md
└── package.json
```

---

## 🚀 Flujo de Trabajo

### 1. Definir un Feature

```bash
# Establecer principios del proyecto (una sola vez)
/speckit.constitution

# Definir qué construir
/speckit.specify Descripción del feature

# Refinar ambigüedades
/speckit.clarify

# Elegir stack técnico y planificar
/speckit.plan Tech stack y arquitectura
```

### 2. Ejecutar con gem-team

```bash
# Desglosar en tareas
/speckit.tasks

# Ejecutar mediante agentes gem-team
# Usa el skill de orquestación:
opencode run --command speckit-to-gem-team "feature description"

# O por skills individuales:
opencode run --command speckit-plan-context
opencode run --command speckit-task-dispatch
```

### 3. Verificar y Converger

```bash
/speckit.converge    # Verificar código vs especificación
/speckit.analyze     # Consistencia cross-artifact
/speckit.checklist   # Checklist de calidad
```

---

## 🧠 Integración Spec Kit + gem-team

Este proyecto usa **Spec Kit** (SDD) para la especificación y planificación, y **gem-team** como orquestador multi-agente para la ejecución.

| Fase SDD | Fase gem-team | Artifact |
|----------|---------------|----------|
| Constitution | Phase 0 — Contexto | `.specify/memory/constitution.md` |
| Specify | Phase 0 — Intento | `specs/<feature>/spec.md` |
| Plan | Phase 2 — Planning | `specs/<feature>/plan.md` |
| Tasks | Phase 2 — DAG | `specs/<feature>/tasks.md` |
| Implement | Phase 3 — Ejecución | `src/` |
| Converge | Phase 3 — Gate | Diff + checklist |

Ver `AGENTS.md` para detalle completo de la integración.

---

## ⚙️ Configuración

- **`.gem-team.yaml`** — Configuración del orquestador (fases, agentes, rutas de artifacts)
- **`AGENTS.md`** — Contexto cargado por los agentes AI en cada sesión
- **`.specify/memory/constitution.md`** — Principios rectores del proyecto
- **`context_envelope.json`** — Contexto compartido entre fases (auto-generado por bridge script)

---

## 📚 Comandos Rápidos

| Comando | Acción |
|---------|--------|
| `/speckit.constitution` | Establecer principios del proyecto |
| `/speckit.specify` | Definir feature |
| `/speckit.plan` | Planificar implementación |
| `/speckit.tasks` | Desglosar en tareas |
| `/speckit.implement` | Ejecutar tareas |
| `/speckit.converge` | Verificar contra spec |
| `speckit-to-gem-team` | Skill: flujo completo orquestado |
| `speckit-plan-context` | Skill: plan.md → gem-planner |
| `speckit-task-dispatch` | Skill: tasks.md → agentes por wave |

---

## 🔄 Actualizar Contexto

```powershell
# El bridge script lee los artifacts de Spec Kit y regenera context_envelope.json
& .\.specify\scripts\powershell\update-context-bridge.ps1 -Force
```

---

## 📄 Licencia

MIT
