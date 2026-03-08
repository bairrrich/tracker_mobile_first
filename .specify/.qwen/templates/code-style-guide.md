# Code Style Guide

## Language Policy

**English only** for all code artifacts.

### ✅ Correct
```typescript
// Fetch user data from API
const isLoading = true;
const hasError = false;

function getUserById(id: string) {
  // Implementation here
}
```

### ❌ Wrong
```typescript
// Загрузка данных пользователя
const zagruzka = true;
const estOshibka = false;

function polzovatelPoId(id: string) {
  // Реализация здесь
}
```

## Naming Conventions

### Variables and Functions
- Use descriptive names with auxiliary verbs
- camelCase for variables and functions
- PascalCase for components and types

```typescript
// ✅ Good
const isLoading = true;
const hasPermission = false;
const canSubmit = true;

function fetchUserData() { }
function isFormValid() { }

// ❌ Bad
const load = true;
const valid = false;
function getData() { }
```

### Files and Directories
- **lowercase-with-dashes** for directories
- **camelCase** or **PascalCase** for files (based on content)

```
✅ components/auth-wizard/
✅ hooks/use-auth.ts
✅ utils/format-date.ts

❌ components/AuthWizard/
❌ components/auth_wizard/
```

### Components
```typescript
// PascalCase for component names
export function UserProfile() { }
export const SubmitButton = () => { };
```

## Code Structure

### File Organization
```typescript
// 1. Imports
import React from 'react';
import { useState } from 'react';

// 2. Types
type Props = { ... };

// 3. Constants
const MAX_ITEMS = 10;

// 4. Component/Function
export function Component({ prop }: Props) {
  // Implementation
}
```

### Component Pattern
```typescript
// Functional components with TypeScript
interface Props {
  title: string;
  isLoading?: boolean;
}

export function Card({ title, isLoading }: Props) {
  // Hook calls first
  const [state, setState] = useState(null);
  
  // Then logic
  if (isLoading) return <LoadingSpinner />;
  
  // Then JSX
  return <div>{title}</div>;
}
```

## Comments and Documentation

### When to Comment
- Complex business logic
- Non-obvious optimizations
- Workarounds for bugs
- API integration quirks

### Comment Style
```typescript
// ✅ Good - explains WHY
// Using debounce to prevent excessive API calls
const debouncedSearch = debounce(search, 300);

// ❌ Bad - explains WHAT (code should be self-explanatory)
// Set loading to true
setLoading(true);
```

### JSDoc
```typescript
/**
 * Formats a date string to locale format.
 * @param date - The date to format
 * @param locale - The locale string (default: 'ru-RU')
 * @returns Formatted date string
 */
function formatDate(date: Date, locale = 'ru-RU'): string {
  // Implementation
}
```

## Error Handling

### Early Returns
```typescript
// ✅ Good
function processUser(user: User | null) {
  if (!user) return null;
  if (!user.isActive) return null;
  
  // Process user
}

// ❌ Bad
function processUser(user: User | null) {
  if (user && user.isActive) {
    // Process user
  }
  return null;
}
```

### Custom Error Types
```typescript
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}
```

## Testing

### Test Naming
```typescript
// ✅ Good
describe('UserProfile', () => {
  it('should display loading state when isLoading is true', () => { });
  it('should show error message when fetch fails', () => { });
});

// ❌ Bad
describe('UserProfile', () => {
  it('should work', () => { });
  it('test 1', () => { });
});
```

### Test Structure (AAA Pattern)
```typescript
it('should calculate total correctly', () => {
  // Arrange
  const items = [{ price: 10 }, { price: 20 }];
  
  // Act
  const total = calculateTotal(items);
  
  // Assert
  expect(total).toBe(30);
});
```

## Checklist for Code Review

- [ ] All names in English
- [ ] No Russian/Cyrillic characters (except localization files)
- [ ] Descriptive variable names with auxiliary verbs
- [ ] Comments explain WHY, not WHAT
- [ ] Early returns for error conditions
- [ ] Proper TypeScript types
- [ ] Tests with descriptive names
- [ ] Directory names in lowercase-with-dashes
