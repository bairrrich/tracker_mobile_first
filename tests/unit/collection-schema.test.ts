/**
 * @jest-environment jsdom
 */

import { collectionSchema } from '@/lib/validations/collection.schema'

describe('Collection Schema Validation', () => {
  describe('collectionSchema', () => {
    it('validates correct collection data', () => {
      const data = {
        name: 'My Collection',
        type: 'books' as const,
        description: 'Test description',
      }

      const result = collectionSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('fails when name is empty', () => {
      const data = {
        name: '',
        type: 'books' as const,
      }

      const result = collectionSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('name')
      }
    })

    it('fails when name is too long', () => {
      const data = {
        name: 'a'.repeat(101),
        type: 'books' as const,
      }

      const result = collectionSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('100 characters')
      }
    })

    it('validates with optional fields', () => {
      const data = {
        name: 'My Collection',
        type: 'custom' as const,
        color: '#FF5733',
        icon: '📦',
      }

      const result = collectionSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('fails with invalid color format', () => {
      const data = {
        name: 'My Collection',
        type: 'books' as const,
        color: 'invalid-color',
      }

      const result = collectionSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('color format')
      }
    })

    it('accepts valid hex color', () => {
      const data = {
        name: 'My Collection',
        type: 'books' as const,
        color: '#123456',
      }

      const result = collectionSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('validates all collection types', () => {
      const types = ['finances', 'exercises', 'books', 'supplements', 'food', 'herbs', 'notes', 'custom'] as const

      types.forEach((type) => {
        const data = {
          name: 'Test',
          type,
        }
        const result = collectionSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    it('fails with invalid type', () => {
      const data = {
        name: 'Test',
        type: 'invalid-type',
      }

      const result = collectionSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })
})
