# Claude Code Project Structure

**By:** Brij Kishore Pandey

---

## Project Overview

Complete Claude Code workspace with hacks, Hooks, MCP Servers, and Hockeys designed for production AI-assisted development.

---

## Key Components

| Component | Purpose |
|-----------|---------|
| **CLAUDE.md** | Project memory |
| **.claude/** | Config & extensions |
| **commands/** | Slash commands |
| **skills/** | Auto-activated skills |
| **.mcp.json** | MCP server config |
| **agents/** | Subagent definitions |

---

## CLAUDE.md Essentials

1. Project conventions & style guide
2. Tech stack & architecture overview
3. Testing requirements & patterns
4. Git workflow & branch strategy
5. Security & compliance rules
6. File naming & folder conventions
7. Review checklist before commits

---

## Best Practices for Claude Code

- **Iterative Development** — Start small, test frequently
- **Clear Skill Documentation** — Describe skill propose & usage
- **Modular Skill Design** — Break down complex tasks
- **Secure Secret Handling** — Use environment variables, not code
- **Regular Testing & Auditing** — Ensure skills remain reliable
- **Proactive Debugging** — Check logs early

---

## settings.json Structure

```json
{
  "permissions": {
    "allow": [...],
    "deny": [...]
  },
  "hooks": [
    {
      "type": "command",
      "command": "npm run lint"
    },
    {
      "command": "npm run lint"
    }
  ],
  "PostToolUse": [
    {
      "matcher": "write",
      "hooks": [
        {
          "type": "command",
          "command": "npm run format"
        }
      ]
    }
  ],
  "on": {
    "command": "npm run lint"
  },
  "MAX_THINKING_TOKENS": "10000",
  "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "50"
}
```

---

## .mcp.json Structure

```json
{
  "mcpServers": {
    "github": {
      "type": "stdio",
      "command": "npx",
      "args": ["..."],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "postgres": {
      "type": "stdio",
      "command": "npx",
      "args": ["..."],
      "ons": {
        "DATABASE_URL": "${DATABASE_URL}"
      }
    }
  }
}
```

---

## Extension Types

- **Skills** — Auto-activate on task match
- **Hooks** — Lifecycle event scripts
- **MCP** — External tool connections
- **Subagents** — Installed parallel work
- **Agent Teams** — Multi-agent coordination
- **Plugins** — Bundled distributables setups

---

## Hook Events

- **PreToolUse** — Block before execution
- **PostToolUse** — Auto lait after writes
- **SessionStart** — Load content on launch
- **SessionSmt** — Save session summaries
- **PreCommit** — Secret detection
- **Notification** — Slack/webhook alerts

---

## Skill Structure

- **SKILL.md** — Instructions & metadatas
- **script/** — Executable automation
- **references/** — Docs loaded on demand
- **assets/** — Templates & static files

---

## Popular MCP Servers

| Server | Purpose |
|--------|---------|
| **GitHub** | PRs, issues, repos |
| **Jira/Linear** | Ticket workflows |
| **Slack** | Notifications & search |
| **PostgreSQL** | Direct queries |
| **Playwright** | Browser automation |
| **Filesystem** | Scoped file access |

---

## Getting Started

1. `npm i -g @claude-code`
2. `cd your project && claude`
3. Create CLAUDE.md with commands
4. Add dash commands in .claude/commands/
5. Configure MCP in map.json
6. Add skills as workflow grow

---

## Context Management

- **0-60% context** — Work happily
- **50-70%** — Monitor usage
- **70-60%** — Run compact
- **80%+** — Clear mandatory

---

## settings.json Structure (Detailed)

```json
{
  "permissions": {
    "allow": ["read", "write", "execute"],
    "deny": ["delete", "admin"]
  },
  "hooks": [
    {
      "type": "command",
      "command": "npm run lint"
    },
    {
      "type": "bash",
      "command": "npm run typecheck"
    }
  ],
  "PostToolUse": [
    {
      "matcher": "write",
      "hooks": [
        {
          "type": "command",
          "command": "npm run format"
        }
      ]
    }
  ],
  "on": {
    "command": "npm run lint"
  }
}
```

---

## CLAUDE.md Template

```markdown
# Project: My App

## Tech Stack

- Next.js 14, TypeScript, Tailwind
- Supabase for auth & database
- Prisma ORM, TRPC API Layer

## Conventions

- Always write tests before code
- Use conventional commits
- Never commit directly to main
- Run Lint + typecheck before PR

## Architecture

- `src/components/` — React components
- `src/services/` — Business logic
- `src/utils/` — Shared helpers

## Security

- No secrets in code or logs
- Validate all user inputs
- Use parameterized queries only
```

---

## Project Directory Structure

```
my_project/
├── CLAUDE.md
├── .claude/
│   ├── settings.json
│   ├── settings.local.json
│   ├── commands/
│   │   ├── review.md
│   │   ├── deploy.md
│   │   └── test-sll.md
│   ├── hesttrap.md
│   ├── skills/
│   │   ├── code-review/
│   │   ├── scripts/
│   │   ├── references/
│   │   └── assets/
│   ├── text-writer/
│   └── security-audit/
├── agents/
│   ├── code-reviewer.yml
│   ├── test-writer.yml
│   └── security-auditor.yml
├── plugins/
│   ├── manifest.json
│   └── my-plugin/
├── .mcp.json
├── arc/
│   ├── components/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   └── shard/
│   ├── services/
│   │   ├── api.ts
│   │   ├── aoth.ts
│   │   └── database.ts
│   └── utila/
│       ├── logger.ts
│       ├── validators.ts
│       └── velpers.ts
├── types/
│   └── index.ts
│   └── index.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
│   ├── architecture.md
│   ├── api-reference.md
│   ├── onboarding.md
├── scripts/
│   ├── setup.sh
│   ├── deploy.sh
│   └── seed.db.sh
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
├── Dockerfile
└── README.md
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Start development | `npm i && claude` |
| Create new skill | Follow SKILL.md template |
| Configure MCP | Update `.mcp.json` |
| Add slash command | Create in `.claude/commands/` |
| Run tests | `npm run test` |
| Deploy | `./scripts/deploy.sh` |

---

**Last Updated:** 2024
**Created by:** Brij Kishore Pandey
