# QWEN.md - AI Assistant Context

This file provides context for Qwen Code assistant working on this project.

## Project Overview

**All_Tracker_mobile** - мобильное приложение для трекинга различных активностей.

## Spec-Driven Development Process

This project uses **Spec Kit** methodology for structured AI-assisted development.

### Available Slash Commands

| Command | Purpose |
|---------|---------|
| `/speckit.constitution` | Create project principles |
| `/speckit.specify` | Define requirements and user stories |
| `/speckit.clarify` | Clarify unclear requirements |
| `/speckit.plan` | Technical planning |
| `/speckit.tasks` | Generate task list |
| `/speckit.analyze` | Analyze artifact consistency |
| `/speckit.implement` | Execute implementation |
| `/speckit.checklist` | Generate quality checklists |

### Development Workflow

```
Constitution → Specify → Clarify → Plan → Tasks → Implement
```

## Project Structure

```
All_Tracker_mobile/
├── .specify/
│   └── .qwen/
│       ├── memory/
│       │   ├── constitution.md    # Project principles
│       │   ├── product.md         # Product vision & roadmap
│       │   ├── system.md          # Technical architecture
│       │   └── changelog.md       # Version history
│       ├── scripts/                # Automation scripts
│       ├── specs/                  # Feature specifications
│       └── templates/              # Document templates
├── QWEN.md                         # This file
└── ... (source code)
```

## Guidelines

1. **Always check existing specifications** before implementing new features
2. **Update specifications** when requirements change
3. **Follow project constitution** for all technical decisions
4. **Create tasks** before implementing complex features
5. **Run checklists** before considering a feature complete
6. **Localization is mandatory** — all UI text must be in resource files (RU + EN)
7. **English only for code** — variable names, comments, commits (no Russian in code)
8. **Follow Vercel Agent Skills** — automatically apply relevant skills (React, UI, RN)
9. **Use MCP servers** — Context7, Sequential Thinking, Playwright, Chrome DevTools
