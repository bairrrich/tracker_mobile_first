# Quality Checklist Template

## Pre-Implementation Checklist

- [ ] Specification reviewed and approved
- [ ] Technical design reviewed
- [ ] Dependencies identified
- [ ] Test strategy defined
- [ ] Localization plan (RU + EN)

---

## Implementation Checklist

### Code Quality

- [ ] Follows project conventions (constitution.md)
- [ ] English only in code (no Russian)
- [ ] Descriptive variable names (`isLoading`, `hasError`)
- [ ] Functions are small and focused
- [ ] No code duplication
- [ ] Proper error handling
- [ ] Input validation with Zod

### Components

- [ ] Using shadcn/ui + Radix UI (no native elements)
- [ ] Components are reusable
- [ ] Proper TypeScript types
- [ ] JSDoc comments for complex logic

### Styling

- [ ] Tailwind CSS classes used
- [ ] OKLCH colors used
- [ ] Mobile-first responsive design
- [ ] Dark mode compatible
- [ ] No custom CSS files

### Accessibility

- [ ] ARIA labels on interactive elements
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Color contrast > 4.5:1
- [ ] Screen reader tested

### Localization

- [ ] All UI text in resource files
- [ ] Russian translations added
- [ ] English translations added
- [ ] No hardcoded strings

### Performance

- [ ] Lazy loading implemented where needed
- [ ] Memoization (useMemo, useCallback) used appropriately
- [ ] No unnecessary re-renders
- [ ] Images optimized (WebP, lazy loading)

### Testing

- [ ] Unit tests written
- [ ] Integration tests written
- [ ] E2E test scenarios identified
- [ ] All tests passing

---

## Pre-Commit Checklist

- [ ] Code compiles without errors
- [ ] All tests pass
- [ ] Linting passes (`npm run lint`)
- [ ] No console.log() in production code
- [ ] No TODO comments (or documented properly)
- [ ] Git commit message follows conventions

---

## Pre-Deployment Checklist

### Functionality

- [ ] All features work as expected
- [ ] Edge cases handled
- [ ] Error states display correctly
- [ ] Loading states implemented

### Offline Support

- [ ] Works without internet
- [ ] Data persists locally (Dexie.js)
- [ ] Sync queue works
- [ ] Offline indicators display

### PWA

- [ ] Manifest.json is correct
- [ ] Service Worker registers
- [ ] App is installable
- [ ] Icons are present

### Performance

- [ ] Lighthouse score > 90
- [ ] First contentful paint < 1.5s
- [ ] Time to interactive < 3.5s
- [ ] Bundle size optimized

### Security

- [ ] No secrets in code
- [ ] Environment variables used
- [ ] Input validation on all forms
- [ ] XSS protection verified

### Browser Compatibility

- [ ] Chrome/Edge tested
- [ ] Safari tested
- [ ] Firefox tested (if applicable)
- [ ] Mobile browsers tested

---

## Post-Deployment Checklist

- [ ] Smoke tests pass in production
- [ ] Monitoring set up
- [ ] Error tracking configured
- [ ] Documentation updated
- [ ] Team notified

---

## Phase Completion Checklist

### For Each Phase

- [ ] All tasks completed
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Ready for next phase

---

## Notes

[Any issues, blockers, or observations]

---

## Sign-off

**Reviewed by:** [Name]  
**Date:** YYYY-MM-DD  
**Status:** Approved | Changes Requested
