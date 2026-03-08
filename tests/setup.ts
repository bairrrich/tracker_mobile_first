import '@testing-library/jest-dom'

// Mock next/navigation
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
}

const mockUseRouter = () => mockRouter
const mockUsePathname = () => '/'
const mockUseSearchParams = () => new URLSearchParams()

Object.defineProperty(global, 'useRouter', { value: mockUseRouter })
Object.defineProperty(global, 'usePathname', { value: mockUsePathname })
Object.defineProperty(global, 'useSearchParams', { value: mockUseSearchParams })

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
})

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})
