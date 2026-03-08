# Spec Kit Process

This project uses **Spec-Driven Development** with Spec Kit methodology.

## Quick Start

### For New Features

1. **Specify** - Create specification in `.specify/.qwen/specs/`
2. **Clarify** - Review and clarify requirements
3. **Plan** - Create implementation plan
4. **Tasks** - Break down into actionable tasks
5. **Implement** - Execute tasks
6. **Checklist** - Verify completion

### Using with Qwen Code

Reference `QWEN.md` for available slash commands and workflow.

## Directory Structure

```
.specify/.qwen/
├── memory/
│   ├── constitution.md      # Project principles
│   ├── product.md           # Product vision & roadmap
│   ├── system.md            # Technical architecture
│   └── changelog.md         # Version history
├── scripts/
│   └── mcp-setup.md         # MCP servers configuration
├── specs/
│   └── 001-feature-name/    # Feature specifications
│       ├── spec.md
│       ├── plan.md
│       ├── tasks.md
│       └── research.md
└── templates/
    ├── spec-template.md
    ├── plan-template.md
    ├── localization-guide.md       # i18n guidelines
    ├── localization-checklist.md   # i18n checklist
    └── code-style-guide.md         # English-only code style
```

## Specification Numbering

Specifications are numbered sequentially:
- `001-initial-setup/`
- `002-user-authentication/`
- `003-data-sync/`

## Quality Checklist

Before marking a feature complete:

- [ ] Specification is up to date
- [ ] All acceptance criteria met
- [ ] Tests written and passing
- [ ] Code reviewed
- [ ] Documentation updated
