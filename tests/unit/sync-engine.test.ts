/**
 * @jest-environment jsdom
 */

import { performSync, pushChanges, pullChanges } from '@/lib/sync-engine'

// Mock fetch
global.fetch = jest.fn()

describe('Sync Engine', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('pushChanges', () => {
    it('returns success when no changes to push', async () => {
      // Mock DB to return empty unsynced
      jest.mock('@/lib/db', () => ({
        db: {
          syncQueue: {
            where: jest.fn().mockReturnValue({
              equals: jest.fn().mockReturnValue({
                toArray: jest.fn().mockResolvedValue([]),
              }),
            }),
          },
        },
      }))

      const result = await pushChanges()
      expect(result.success).toBe(true)
      expect(result.count).toBe(0)
    })

    it('sends changes to API endpoint', async () => {
      const mockChanges = [
        { id: 1, table: 'collections', recordId: 1, operation: 'insert', data: '{}', synced: false },
      ]

      // Mock DB
      jest.mock('@/lib/db', () => ({
        db: {
          syncQueue: {
            where: jest.fn().mockReturnValue({
              equals: jest.fn().mockReturnValue({
                toArray: jest.fn().mockResolvedValue(mockChanges),
              }),
            }),
          },
        },
      }))

      // Mock fetch
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ processed: [1] }),
      })

      const result = await pushChanges()
      expect(result.success).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith('/api/sync', expect.any(Object))
    })

    it('handles API errors', async () => {
      // Mock DB
      jest.mock('@/lib/db', () => ({
        db: {
          syncQueue: {
            where: jest.fn().mockReturnValue({
              equals: jest.fn().mockReturnValue({
                toArray: jest.fn().mockResolvedValue([{ id: 1 }]),
              }),
            }),
          },
        },
      }))

      // Mock fetch error
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      const result = await pushChanges()
      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('pullChanges', () => {
    it('returns success when no remote changes', async () => {
      // Mock fetch
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ changes: [] }),
      })

      const result = await pullChanges()
      expect(result.success).toBe(true)
    })

    it('handles network errors', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      const result = await pullChanges()
      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('performSync', () => {
    it('performs full sync (push + pull)', async () => {
      // Mock push and pull
      jest.mock('@/lib/sync-engine', () => ({
        pushChanges: jest.fn().mockResolvedValue({ success: true, count: 0, errors: [] }),
        pullChanges: jest.fn().mockResolvedValue({ success: true, count: 0, errors: [] }),
        updateLastSyncTime: jest.fn(),
      }))

      const result = await performSync()
      expect(result.success).toBe(true)
      expect(result.lastSync).toBeInstanceOf(Date)
    })
  })
})
