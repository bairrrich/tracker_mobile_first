# Localization (i18n) Guide

## Supported Languages

| Code | Language | Native Name |
|------|----------|-------------|
| `ru` | Russian | Русский |
| `en` | English | English |

## File Structure

```
lib/
└── l10n/
    ├── l10n.dart              # Localization setup
    ├── app_localizations.dart # Base class
    └── lang/
        ├── app_ru.arb         # Russian translations
        └── app_en.arb         # English translations
```

## Key Naming Convention

```
<category>.<subcategory>.<name>

Examples:
- screens.login.title
- screens.login.submitButton
- common.cancel
- common.confirm
- errors.networkError
- dialogs.confirmDelete.title
```

## Adding New Translations

### 1. Add to ARB files

**app_ru.arb:**
```json
{
  "screens.settings.title": "Настройки",
  "screens.settings.theme": "Тема",
  "@screens.settings.theme": {
    "description": "Settings screen - theme option"
  }
}
```

**app_en.arb:**
```json
{
  "screens.settings.title": "Settings",
  "screens.settings.theme": "Theme",
  "@screens.settings.theme": {
    "description": "Settings screen - theme option"
  }
}
```

### 2. Use in Code

```dart
// ❌ Wrong - hardcoded string
Text('Настройки')

// ✅ Correct - localized
Text(context.l10n.screens.settings.title)
```

## Checklist for New Features

When creating any new module/component/form:

- [ ] Create namespace for the feature (e.g., `screens.profile.*`)
- [ ] Add all Russian translations to `app_ru.arb`
- [ ] Add all English translations to `app_en.arb`
- [ ] Verify no hardcoded strings in UI code
- [ ] Test both language variants
- [ ] Update this guide if new patterns are needed

## Common Categories

| Category | Usage |
|----------|-------|
| `screens.*` | Screen titles, screen-specific text |
| `widgets.*` | Reusable widget text |
| `common.*` | Shared buttons, labels (Cancel, OK, Save) |
| `errors.*` | Error messages |
| `dialogs.*` | Dialog titles and messages |
| `validation.*` | Form validation messages |
| `notifications.*` | Push notification text |

## Resources

- [Flutter Internationalization](https://docs.flutter.dev/ui/accessibility-and-localization/internationalization)
- [ARB Format Specification](https://github.com/google/app-resource-box/wiki/ARBFormat)
