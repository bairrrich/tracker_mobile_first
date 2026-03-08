# Localization Checklist

## For Every New Module/Component/Form

### Before Implementation
- [ ] Plan all user-facing text strings
- [ ] Create namespace for the feature (e.g., `screens.<name>.*`)
- [ ] Review existing translations for reusable strings

### During Implementation
- [ ] Add Russian translations to `app_ru.arb`
- [ ] Add English translations to `app_en.arb`
- [ ] Use localization keys in code (no hardcoded strings)
- [ ] Add descriptions for non-obvious translations

### Before Commit
- [ ] Verify all UI text uses localization
- [ ] Search for hardcoded strings: `'[A-Za-z]'` in UI files
- [ ] Test with Russian locale
- [ ] Test with English locale
- [ ] Check for overflow/layout issues with both languages

### Common Strings (reuse when possible)

```
common.cancel          — Отмена / Cancel
common.confirm         — Подтвердить / Confirm
common.save            — Сохранить / Save
common.delete          — Удалить / Delete
common.edit            — Редактировать / Edit
common.close           — Закрыть / Close
common.loading         — Загрузка... / Loading...
common.error           — Ошибка / Error
common.success         — Успешно / Success
common.retry           — Повторить / Retry
```

## Quick Reference

**Namespace patterns:**
- `screens.<screen_name>.<element>`
- `widgets.<widget_name>.<element>`
- `dialogs.<dialog_name>.<element>`
- `errors.<category>.<name>`
- `validation.<field_name>.<error_type>`
