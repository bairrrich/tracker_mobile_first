/**
 * Soft Delete Utilities for Offline-First Sync
 * 
 * Provides tombstone-based deletion that syncs properly across devices.
 * 
 * Key principles:
 * 1. Records are never physically deleted until after tombstone retention period
 * 2. Deleted records are marked with deleted=true and deletedAt timestamp
 * 3. Tombstones sync to all devices before final cleanup
 * 4. Default queries exclude deleted records
 */

import { generateUUID } from './uuid'

/**
 * Create a tombstone for a deleted record
 */
export function createTombstone() {
  return {
    deleted: true,
    deletedAt: new Date(),
  }
}

/**
 * Check if a record is a tombstone (soft deleted)
 */
export function isTombstone(record: { deleted?: boolean; deletedAt?: Date }): boolean {
  return record.deleted === true
}

/**
 * Filter out tombstones from a list of records
 */
export function filterActive<T extends { deleted?: boolean; deletedAt?: Date }>(
  records: T[]
): T[] {
  return records.filter(r => !isTombstone(r))
}

/**
 * Generate a unique ID for sync queue (separate from record IDs)
 */
export function generateSyncQueueId(): string {
  return generateUUID()
}

/**
 * Conflict resolution strategies for offline-first sync
 */
export enum ConflictStrategy {
  /** Last write wins based on timestamp */
  LAST_WRITE_WINS = 'last_write_wins',
  /** Deletion always wins over modifications */
  DELETE_WINS = 'delete_wins',
  /** Manual resolution required */
  MANUAL = 'manual',
}

/**
 * Resolve conflict between local and remote versions
 * 
 * @param localVersion - Local record version
 * @param remoteVersion - Remote record version  
 * @param strategy - Conflict resolution strategy
 * @returns The winning version, or null for manual resolution
 */
export function resolveConflict<T extends { 
  updatedAt?: Date; 
  deleted?: boolean;
  deletedAt?: Date;
}>(
  localVersion: T,
  remoteVersion: T,
  strategy: ConflictStrategy = ConflictStrategy.LAST_WRITE_WINS
): T | null {
  // If one is deleted and the other isn't
  const localDeleted = isTombstone(localVersion)
  const remoteDeleted = isTombstone(remoteVersion)

  if (localDeleted && !remoteDeleted) {
    // Local was deleted, remote was modified
    if (strategy === ConflictStrategy.DELETE_WINS) {
      return localVersion // Keep deletion
    }
    // For LAST_WRITE_WINS, compare timestamps
    if (localVersion.deletedAt && remoteVersion.updatedAt) {
      return localVersion.deletedAt > remoteVersion.updatedAt ? localVersion : remoteVersion
    }
    return localVersion // Default to delete wins
  }

  if (!localDeleted && remoteDeleted) {
    // Remote was deleted, local was modified
    if (strategy === ConflictStrategy.DELETE_WINS) {
      return remoteVersion // Accept deletion
    }
    // For LAST_WRITE_WINS, compare timestamps
    if (remoteVersion.deletedAt && localVersion.updatedAt) {
      return remoteVersion.deletedAt > localVersion.updatedAt ? remoteVersion : localVersion
    }
    return remoteVersion // Default to delete wins
  }

  if (localDeleted && remoteDeleted) {
    // Both deleted - use the earlier deletion (first to delete wins)
    if (localVersion.deletedAt && remoteVersion.deletedAt) {
      return localVersion.deletedAt <= remoteVersion.deletedAt ? localVersion : remoteVersion
    }
    return localVersion
  }

  // Neither deleted - use strategy
  switch (strategy) {
    case ConflictStrategy.LAST_WRITE_WINS:
      if (localVersion.updatedAt && remoteVersion.updatedAt) {
        return localVersion.updatedAt >= remoteVersion.updatedAt ? localVersion : remoteVersion
      }
      return localVersion

    case ConflictStrategy.DELETE_WINS:
      // Already handled above - neither is deleted
      return localVersion

    case ConflictStrategy.MANUAL:
      return null // Signal that manual resolution is needed

    default:
      return localVersion
  }
}

/**
 * Get records modified since a given date (for sync)
 * Includes both updated and deleted records (tombstones)
 */
export function getModifiedSince<T extends { 
  updatedAt?: Date;
  deletedAt?: Date;
}>(
  records: T[],
  since: Date
): T[] {
  return records.filter(record => {
    // Check if record was updated since the given date
    if (record.updatedAt && record.updatedAt > since) {
      return true
    }
    // Check if record was deleted since the given date
    if (record.deletedAt && record.deletedAt > since) {
      return true
    }
    return false
  })
}

/**
 * Check if a tombstone is old enough to be cleaned up
 * 
 * @param record - Record to check
 * @param retentionDays - Number of days to retain tombstones (default: 90)
 * @returns true if the tombstone can be cleaned up
 */
export function isTombstoneExpired(
  record: { deletedAt?: Date },
  retentionDays: number = 90
): boolean {
  if (!record.deletedAt) return false
  
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays)
  
  return record.deletedAt < cutoffDate
}
