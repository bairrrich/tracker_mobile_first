import { withDB, type Tag, type Note } from '@/lib/db'

export interface CreateTagData {
  name: string
  color?: string
}

export interface CreateNoteData {
  itemId: number
  content: string
}

export class TagsRepository {
  /**
   * Get all tags
   */
  async getAll(): Promise<Tag[]> {
    return withDB((db) => db.tags.orderBy('name').toArray()) ?? []
  }

  /**
   * Get tag by ID
   */
  async getById(id: number): Promise<Tag | undefined> {
    return withDB((db) => db.tags.get(id)) ?? undefined
  }

  /**
   * Get tags by item ID
   */
  async getByItem(itemId: number): Promise<Tag[]> {
    const itemTags = (await withDB((db) => db.itemTags.where('itemId').equals(itemId).toArray())) ?? []
    const tagIds = itemTags.map((it) => it.tagId)
    return (await withDB((db) => db.tags.where('id').anyOf(tagIds).toArray())) ?? []
  }

  /**
   * Create a tag
   */
  async create(data: CreateTagData): Promise<number> {
    const id = await withDB((db) =>
      db.tags.add({
        id: Date.now() + Math.floor(Math.random() * 1000),
        name: data.name,
        color: data.color,
        createdAt: new Date(),
      })
    ) ?? 0

    return id as number
  }

  /**
   * Update a tag
   */
  async update(id: number, data: Partial<CreateTagData>): Promise<void> {
    await withDB((db) => db.tags.update(id, data))
  }

  /**
   * Delete a tag
   */
  async delete(id: number): Promise<void> {
    await withDB((db) => db.itemTags.where('tagId').equals(id).delete())
    await withDB((db) => db.tags.delete(id))
  }

  /**
   * Add tag to item
   */
  async addToItem(itemId: number, tagId: number): Promise<void> {
    await withDB((db) =>
      db.itemTags.add({
        itemId,
        tagId,
      })
    )
  }

  /**
   * Remove tag from item
   */
  async removeFromItem(itemId: number, tagId: number): Promise<void> {
    const itemTags = (await withDB((db) => db.itemTags.toArray())) ?? []
    const itemTag = itemTags.find((it) => it.itemId === itemId && it.tagId === tagId)
    if (itemTag && itemTag.id) {
      await withDB((db) => db.itemTags.delete(itemTag.id))
    }
  }

  /**
   * Set item tags (replaces all existing tags)
   */
  async setItemTags(itemId: number, tagIds: number[]): Promise<void> {
    // Remove existing tags
    await withDB((db) => db.itemTags.where('itemId').equals(itemId).delete())

    // Add new tags
    for (const tagId of tagIds) {
      await this.addToItem(itemId, tagId)
    }
  }

  /**
   * Search tags by name
   */
  async search(query: string): Promise<Tag[]> {
    const lowerQuery = query.toLowerCase()
    return withDB((db) =>
      db.tags
        .filter((tag) => tag.name.toLowerCase().includes(lowerQuery))
        .toArray()
    ) ?? []
  }
}

export class NotesRepository {
  /**
   * Get notes by item ID
   */
  async getByItem(itemId: number): Promise<Note[]> {
    return withDB((db) => db.notes.where('itemId').equals(itemId).toArray()) ?? []
  }

  /**
   * Get note by ID
   */
  async getById(id: number): Promise<Note | undefined> {
    return withDB((db) => db.notes.get(id)) ?? undefined
  }

  /**
   * Create a note
   */
  async create(data: CreateNoteData): Promise<number> {
    const now = new Date()
    const id = await withDB((db) =>
      db.notes.add({
        id: Date.now() + Math.floor(Math.random() * 1000),
        itemId: data.itemId,
        content: data.content,
        createdAt: now,
        updatedAt: now,
      })
    ) ?? 0

    return id as number
  }

  /**
   * Update a note
   */
  async update(id: number, content: string): Promise<void> {
    await withDB((db) =>
      db.notes.update(id, {
        content,
        updatedAt: new Date(),
      })
    )
  }

  /**
   * Delete a note
   */
  async delete(id: number): Promise<void> {
    await withDB((db) => db.notes.delete(id))
  }

  /**
   * Search notes by content
   */
  async search(query: string): Promise<Note[]> {
    const lowerQuery = query.toLowerCase()
    return withDB((db) =>
      db.notes
        .filter((note) => note.content.toLowerCase().includes(lowerQuery))
        .toArray()
    ) ?? []
  }
}

export const tagsRepository = new TagsRepository()
export const notesRepository = new NotesRepository()
