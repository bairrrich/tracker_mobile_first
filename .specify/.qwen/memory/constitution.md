# Project Constitution

## Core Principles

### 1. Code Quality
- Write clean, readable, and maintainable code
- Follow established naming conventions
- Keep functions small and focused
- Prefer composition over inheritance

### 2. Testing
- Write tests for all new features
- Maintain high test coverage
- Tests should be fast and reliable

### 3. Documentation
- Document public APIs
- Keep documentation up to date
- Use meaningful commit messages

### 4. User Experience
- Prioritize responsive UI
- Handle errors gracefully
- Provide clear feedback to users

### 5. Performance
- Optimize for mobile constraints
- Minimize battery usage
- Efficient memory management

### 6. Security
- Never commit secrets or API keys
- Validate all user inputs
- Follow security best practices

### 7. Localization (i18n)
- **All user-facing text must be localized** — no hardcoded strings
- **Localization is mandatory** for every new module/component/form
- Use resource files for all languages from the start (minimum: Russian + English)
- Localization keys should be descriptive and namespaced (e.g., `screens.login.title`)
- **Definition of Done** for any UI feature includes:
  - All text extracted to localization files
  - translations added for all supported languages
  - No hardcoded strings in UI code

## Design Principles

### 1. Mobile First
- Use CSS media queries for progressive enhancement (from mobile screens to desktop)
- Design for touch interfaces first
- Optimize for limited screen real estate

### 2. Minimalism
- Only essential elements
- **Fonts:** sans-serif (Inter or system-ui)
- **Spacing:** generous whitespace, thin lines
- **Icons over text** where possible
- **No emojis** in UI

### 3. OKLCH Colors
- Use OKLCH color space for uniform perception and accessibility
- Format: `oklch(L C H)` — Lightness, Chroma, Hue
- Ensures WCAG contrast compliance
- Example: `oklch(0.5 0.1 200)`
- Supported in Chrome/Edge/Safari since 2022

### 4. Themes
- Light (day) and Dark (night) modes
- Optional color variations
- Switch via CSS variables and localStorage

### 5. Accessibility
- ARIA attributes on interactive elements
- Contrast ratio > 4.5:1
- Full keyboard navigation support
- Screen reader compatibility

### 6. Styling Stack
- **Tailwind CSS** — utility-first, rapid UI development
- Integrates with OKLCH and themes
- No custom CSS files

### 7. Component Libraries (Mandatory)
- **shadcn/ui** + **Radix UI** — обязательные библиотеки компонентов
- **Запрещено использование нативных HTML элементов** для UI компонентов:
  - ❌ Нативные `<input>`, `<select>`, `<textarea>` — использовать компоненты shadcn/ui
  - ❌ Нативные `<button>` — использовать `Button` из shadcn/ui
  - ❌ Нативные выпадающие списки — использовать `Select` из Radix UI
  - ❌ Нативные календари и date picker — использовать `Calendar` / `DatePicker` компоненты
  - ❌ Нативные чекбоксы и радиокнопки — использовать `Checkbox`, `RadioGroup` из Radix UI
- **Создавайте переиспользуемые компоненты** в `/components/ui/` на основе shadcn/ui
- Все формы, модальные окна, таблицы должны использовать готовые компоненты
- Tailwind-integrated

### 8. Icons
- **Lucide Icons** или **Heroicons** — vector, lightweight
- Consistent stroke width
- Accessible with aria-labels

## Code Style and Structure

### Language Policy
- **English only** for all code artifacts:
  - Variable and function names
  - Comments and documentation
  - Commit messages
  - Test names
  - Configuration files
- No Russian/Cyrillic characters in code or comments
- Localization files (`.arb`) are the only exception for non-English text

### General Principles
- Write concise, technical TypeScript code with accurate examples
- Use **functional and declarative** programming patterns; avoid classes
- Favor **iteration and modularization** over code duplication
- Use **descriptive variable names** with auxiliary verbs (e.g., `isLoading`, `hasError`)
- Structure files with: exported components, subcomponents, helpers, static content, types
- Use **lowercase with dashes** for directory names (e.g., `components/auth-wizard`)

### Optimization and Best Practices
- Minimize `'use client'`, `useEffect`, and `setState`; favor React Server Components (RSC) and Next.js SSR
- Implement **dynamic imports** for code splitting and optimization
- Use **responsive design** with mobile-first approach
- **Image optimization:** WebP format, size data, lazy loading

### Error Handling and Validation
- Prioritize error handling and edge cases:
  - Use **early returns** for error conditions
  - Implement **guard clauses** for preconditions and invalid states
  - Use **custom error types** for consistent handling

### State Management and Data Fetching
- **Zustand** for global state
- **TanStack React Query** for data fetching and caching
- **Zod** for schema validation

### Security and Performance
- Proper error handling and input validation
- Secure coding practices (XSS, CSRF protection)
- Performance optimization: reduced load times, efficient rendering

### Testing and Documentation
- **Jest** + **React Testing Library** for unit tests
- Clear, concise comments for complex logic
- **JSDoc** for functions and components (IDE intellisense)

## Development Methodology

### 1. System 2 Thinking
- Analytical rigor in problem-solving
- Break down requirements into smaller parts
- Thoroughly consider each step before implementation

### 2. Tree of Thoughts
- Evaluate multiple possible solutions
- Consider consequences of each approach
- Use structured exploration to find optimal solution

### 3. Iterative Refinement
- Consider improvements, edge cases, optimizations before finalizing
- Iterate through potential enhancements
- Ensure robust final solution

### 4. Follow Agent Skills
- **Vercel Agent Skills** are mandatory for all relevant tasks
- Automatically apply skills when working on:
  - React/Next.js components → `vercel-react-best-practices`
  - UI/UX design → `web-design-guidelines`
  - React Native code → `vercel-react-native-skills`
  - Component composition → `vercel-composition-patterns`
- Review skill guidelines before implementing features
- Skills take precedence over personal coding preferences

## MCP Servers

This project uses **MCP (Model Context Protocol) servers** for enhanced capabilities:

| MCP Server | Purpose | When to Use |
|------------|---------|-------------|
| **Context7** | Documentation lookup | Before implementing unfamiliar APIs |
| **Sequential Thinking** | Structured problem-solving | Complex decisions, architecture, debugging |
| **Playwright** | E2E testing, browser automation | Testing critical user flows |
| **Chrome DevTools** | Browser debugging, performance | Performance profiling, network debugging |

### MCP Usage Guidelines

1. **Context7**: Use for API documentation and code examples
2. **Sequential Thinking**: Use for multi-step problems and planning
3. **Playwright**: Write tests for all critical paths
4. **Chrome DevTools**: Profile and debug browser issues

Configuration: See `.specify/.qwen/scripts/mcp-setup.md`

## Technical Decisions

- All architectural decisions must align with these principles
- When in doubt, refer to this constitution for guidance
- Update this document when new principles are established

## Agent Skills

This project uses **Vercel Agent Skills** for enhanced AI assistance:

| Skill | Auto-activates on |
|-------|-------------------|
| `vercel-react-best-practices` | React/Next.js code review, performance tasks |
| `web-design-guidelines` | UI audits, accessibility checks, design reviews |
| `vercel-react-native-skills` | React Native/Expo development |
| `vercel-composition-patterns` | Component composition patterns |
| `deploy-to-vercel` | Deployment requests |

Skills are stored in `.agents/skills/` and automatically applied by supported AI agents.

## Spec-Driven Process

- Requirements must be specified before implementation
- Changes to specifications require updating related artifacts
- Implementation follows the approved plan and tasks
