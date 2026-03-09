import { chromium } from 'playwright'

async function debugSync() {
  console.log('Launching browser...')
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()

  // Capture console messages
  const consoleMessages: string[] = []
  const errors: string[] = []
  const networkRequests: any[] = []

  page.on('console', (msg) => {
    const text = msg.text()
    consoleMessages.push(text)
    if (text.includes('[Sync API]')) {
      console.log('[CONSOLE]', text)
      if (text.includes('Error') || text.includes('error')) {
        console.log('*** ERROR FOUND ***', text)
      }
    }
  })

  page.on('pageerror', (error) => {
    errors.push(error.message)
    console.log('[PAGE ERROR]', error.message)
  })

  page.on('request', (request) => {
    if (request.url().includes('/api/sync')) {
      console.log('[NETWORK REQUEST]', request.method(), request.url())
      console.log('[NETWORK POST DATA]', request.postData())
    }
  })

  page.on('response', async (response) => {
    if (response.url().includes('/api/sync')) {
      const status = response.status()
      let body = ''
      try {
        body = await response.text()
      } catch (e) {
        body = 'Could not read response body'
      }
      networkRequests.push({
        url: response.url(),
        status,
        body,
      })
      console.log('[NETWORK RESPONSE]', status, body)
      if (status !== 200 || body.includes('error') || body.includes('Error')) {
        console.log('*** ERROR RESPONSE ***', status, body)
      }
    }
  })

  // Navigate to the page
  console.log('Navigating to http://localhost:3000...')
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })

  // Add 3 test books and trigger sync
  console.log('\n=== ADDING 3 TEST BOOKS ===')
  const addBooksResult = await page.evaluate(async () => {
    return new Promise((resolve) => {
      const request = indexedDB.open('tracker_db')
      request.onsuccess = () => {
        const db = request.result
        const tx = db.transaction(['books', 'syncQueue'], 'readwrite')
        const booksStore = tx.objectStore('books')
        const syncQueueStore = tx.objectStore('syncQueue')
        
        const books = [
          {
            id: Date.now(),
            title: 'Test Book 1',
            author: 'Author 1',
            status: 'reading',
            createdAt: new Date(),
            updatedAt: new Date(),
            synced: false
          },
          {
            id: Date.now() + 1,
            title: 'Test Book 2',
            author: 'Author 2',
            status: 'completed',
            createdAt: new Date(),
            updatedAt: new Date(),
            synced: false
          },
          {
            id: Date.now() + 2,
            title: 'Test Book 3',
            author: 'Author 3',
            status: 'planned',
            createdAt: new Date(),
            updatedAt: new Date(),
            synced: false
          }
        ]
        
        const addedBooks: any[] = []
        const syncQueueItems: any[] = []
        
        books.forEach((book, index) => {
          const addRequest = booksStore.add(book)
          addRequest.onsuccess = () => {
            addedBooks.push({ id: addRequest.result, ...book })
            
            // Add to sync queue
            syncQueueStore.add({
              id: Date.now() + index * 100,
              table: 'books',
              recordId: addRequest.result,
              operation: 'insert',
              data: JSON.stringify(book),
              synced: false,
              createdAt: new Date()
            }).onsuccess = (e: any) => {
              syncQueueItems.push({ id: e.target.result, bookId: addRequest.result })
              if (addedBooks.length === 3 && syncQueueItems.length === 3) {
                resolve({ books: addedBooks, syncQueue: syncQueueItems })
              }
            }
          }
        })
      }
      request.onerror = () => {
        resolve({ error: request.error?.message })
      }
    })
  })
  
  console.log('Added books result:', JSON.stringify(addBooksResult, null, 2))
  
  // Trigger manual sync
  console.log('\n=== TRIGGERING MANUAL SYNC ===')
  await page.evaluate(() => {
    localStorage.setItem('forceSync', 'true')
    window.dispatchEvent(new Event('storage'))
  })

  // Check IndexedDB content
  console.log('\n=== CHECKING INDEXEDDB ===')
  const dbContent = await page.evaluate(async () => {
    return new Promise((resolve) => {
      // Don't specify version to use existing
      const request = indexedDB.open('tracker_db')
      request.onsuccess = () => {
        const db = request.result
        const storeNames = Array.from(db.objectStoreNames)
        console.log('Available stores:', storeNames)
        console.log('Database version:', db.version)
        
        const result: any = { storeNames, syncQueue: [], books: [], dbVersion: db.version }
        
        if (storeNames.includes('syncQueue')) {
          const tx = db.transaction(['syncQueue'], 'readonly')
          const syncQueueStore = tx.objectStore('syncQueue')
          const syncQueueRequest = syncQueueStore.getAll()
          syncQueueRequest.onsuccess = () => {
            result.syncQueue = syncQueueRequest.result
            result.unsyncedCount = result.syncQueue.filter((r: any) => !r.synced).length
            console.log('SyncQueue records:', result.syncQueue.length)
            console.log('Unsynced records:', result.unsyncedCount)
            
            if (storeNames.includes('books')) {
              const tx2 = db.transaction(['books'], 'readonly')
              const booksStore = tx2.objectStore('books')
              const booksRequest = booksStore.getAll()
              booksRequest.onsuccess = () => {
                result.books = booksRequest.result
                console.log('Books:', result.books.length)
                resolve(result)
              }
            } else {
              resolve(result)
            }
          }
        } else {
          resolve(result)
        }
      }
      request.onerror = () => {
        resolve({ error: request.error?.message })
      }
    })
  })
  
  console.log('IndexedDB Content:', JSON.stringify(dbContent, null, 2))

  // Wait a bit for sync to occur
  console.log('\n=== WAITING FOR SYNC OPERATIONS ===')
  await page.waitForTimeout(10000)

  // Check for sync-related console messages
  const syncMessages = consoleMessages.filter(msg => 
    msg.includes('[Sync API]') || msg.includes('[Sync Engine]')
  )

  console.log('\n=== SYNC-RELATED CONSOLE MESSAGES ===')
  syncMessages.forEach(msg => console.log(msg))

  console.log('\n=== ERRORS ===')
  errors.forEach(err => console.log(err))

  console.log('\n=== NETWORK REQUESTS ===')
  networkRequests.forEach(req => {
    console.log(`Status: ${req.status}`)
    console.log(`Body: ${req.body}`)
  })

  // Take a screenshot
  await page.screenshot({ path: 'debug-sync-screenshot.png' })
  console.log('Screenshot saved to debug-sync-screenshot.png')

  await browser.close()

  return { consoleMessages, errors, networkRequests }
}

debugSync().catch(console.error)
