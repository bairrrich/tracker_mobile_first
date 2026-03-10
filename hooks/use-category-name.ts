import { useTranslations } from 'next-intl'
import { ALL_PREDEFINED_CATEGORIES } from '@/lib/finance-categories'

/**
 * Hook to get localized category name by ID
 * Used for displaying predefined categories with localization
 */
export function useCategoryName(categoryId: string | undefined): string {
  const t = useTranslations('Finances')
  
  if (!categoryId) return ''
  
  const category = ALL_PREDEFINED_CATEGORIES.find(c => c.id === categoryId)
  if (!category) return categoryId // Return ID if not a predefined category
  
  return t(category.nameKey)
}

/**
 * Hook to get all predefined categories with localized names
 */
export function usePredefinedCategories(type?: 'income' | 'expense') {
  const t = useTranslations('Finances')
  
  let categories = ALL_PREDEFINED_CATEGORIES
  if (type === 'income') {
    categories = categories.filter(c => 
      ALL_PREDEFINED_CATEGORIES.find(i => i.id === c.id && 
        ['salary', 'gifts', 'investments', 'other_income'].includes(c.id)
      )
    )
  } else if (type === 'expense') {
    categories = categories.filter(c => 
      ALL_PREDEFINED_CATEGORIES.find(i => i.id === c.id && 
        ['groceries', 'transport', 'housing', 'entertainment', 'health', 'clothing', 'communication', 'education', 'fees', 'other_expense'].includes(c.id)
      )
    )
  }
  
  return categories.map(c => ({
    ...c,
    name: t(c.nameKey),
  }))
}