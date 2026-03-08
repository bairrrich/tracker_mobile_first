# System Memory

## Architecture Overview

### Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Framework** | Next.js 14+ | Latest |
| **Language** | TypeScript | Latest |
| **Styling** | Tailwind CSS | Latest |
| **UI Components** | shadcn/ui + Radix UI | Latest |
| **Icons** | Lucide Icons | Latest |
| **State Management** | Zustand | Latest |
| **Data Fetching** | TanStack React Query | Latest |
| **Validation** | Zod | Latest |
| **Testing** | Jest + React Testing Library | Latest |
| **Color Space** | OKLCH | Native CSS |

### Color System

All colors use **OKLCH** color space for accessibility and uniform perception:

```css
/* Example OKLCH colors */
--primary: oklch(0.5 0.1 200);
--success: oklch(0.6 0.12 140);
--warning: oklch(0.7 0.1 80);
--error: oklch(0.5 0.15 25);
```

### Theme System

- **Light mode** (default)
- **Dark mode** (night)
- Optional color variations
- Stored in `localStorage`
- CSS variables for theming

### Project Locale

- **Code language:** English only
- **UI languages:** Russian + English
- **Localization files:** `.arb` format

```
┌─────────────────────────────────────────┐
│           Presentation Layer            │
│  (Screens, Views, Widgets, Components)  │
├─────────────────────────────────────────┤
│            Business Logic Layer         │
│     (ViewModels, Controllers, BLoC)     │
├─────────────────────────────────────────┤
│              Data Layer                 │
│  (Repositories, Data Sources, Models)   │
├─────────────────────────────────────────┤
│            Platform Layer               │
│    (Local Storage, Network, APIs)       │
└─────────────────────────────────────────┘
```

## Project Structure

```
lib/
├── core/                    # Core utilities, constants, errors
│   ├── errors/
│   ├── utils/
│   └── constants/
├── data/                    # Data layer
│   ├── models/
│   ├── repositories/
│   └── datasources/
├── domain/                  # Business logic layer
│   ├── entities/
│   ├── usecases/
│   └── repositories/
├── presentation/            # UI layer
│   ├── screens/
│   ├── widgets/
│   └── themes/
└── di/                      # Dependency injection
```

## Key Design Decisions

### Decision 1: [TBD]
- **Status:** Proposed | Accepted | Rejected
- **Context:** [Why this decision was made]
- **Consequences:** [What resulted from this decision]

### Decision 2: [TBD]
- **Status:** Proposed | Accepted | Rejected
- **Context:** [Why this decision was made]
- **Consequences:** [What resulted from this decision]

## Dependencies

### Production Dependencies
```
[TBD]
```

### Development Dependencies
```
[TBD]
```

## Build & Development

### Setup
```bash
# Install dependencies
[TBD]

# Run development build
[TBD]

# Run tests
[TBD]
```

### Build Commands
```bash
# Debug build
[TBD]

# Release build
[TBD]
```

## Testing Strategy

| Test Type | Coverage Goal | Tools |
|-----------|---------------|-------|
| Unit Tests | 80%+ | [TBD] |
| Widget Tests | Key widgets | [TBD] |
| Integration Tests | Critical paths | [TBD] |
| E2E Tests | Main flows | [TBD] |

## Performance Guidelines

- App startup time: < 2 seconds
- Frame rate: 60 FPS
- Memory footprint: < 100 MB
- Bundle size: < 50 MB

## Security Considerations

- No hardcoded secrets
- Secure local storage for sensitive data
- Input validation on all user inputs
- Regular dependency updates
