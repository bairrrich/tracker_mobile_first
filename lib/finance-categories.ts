// Finance category definitions with localization keys
// Categories are stored in DB with these IDs, but displayed with localized names

export interface CategoryDefinition {
  id: string
  icon: string
  color: string
  nameKey: string  // Key for localization
}

export const PREDEFINED_INCOME_CATEGORIES: CategoryDefinition[] = [
  { id: 'salary', icon: '💰', color: '#22c55e', nameKey: 'salary' },
  { id: 'gifts', icon: '🎁', color: '#ec4899', nameKey: 'gifts' },
  { id: 'investments', icon: '📈', color: '#3b82f6', nameKey: 'investments' },
  { id: 'other_income', icon: '➕', color: '#14b8a6', nameKey: 'otherIncome' },
]

export const PREDEFINED_EXPENSE_CATEGORIES: CategoryDefinition[] = [
  { id: 'groceries', icon: '🛒', color: '#f97316', nameKey: 'groceries' },
  { id: 'transport', icon: '🚗', color: '#6366f1', nameKey: 'transport' },
  { id: 'housing', icon: '🏠', color: '#8b5cf6', nameKey: 'housing' },
  { id: 'entertainment', icon: '🎬', color: '#ec4899', nameKey: 'entertainment' },
  { id: 'health', icon: '❤️', color: '#ef4444', nameKey: 'health' },
  { id: 'clothing', icon: '👕', color: '#f43f5e', nameKey: 'clothing' },
  { id: 'communication', icon: '📱', color: '#06b6d4', nameKey: 'communication' },
  { id: 'education', icon: '📚', color: '#84cc16', nameKey: 'education' },
  { id: 'fees', icon: '💳', color: '#64748b', nameKey: 'fees' },
  { id: 'other_expense', icon: '➖', color: '#475569', nameKey: 'otherExpense' },
]

export const ALL_PREDEFINED_CATEGORIES = [
  ...PREDEFINED_INCOME_CATEGORIES,
  ...PREDEFINED_EXPENSE_CATEGORIES,
]