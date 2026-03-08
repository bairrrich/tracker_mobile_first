# MCP Servers Configuration

This project uses the following MCP (Model Context Protocol) servers for enhanced AI capabilities.

## Configured Servers

### 1. Context7
**Purpose:** Access to up-to-date documentation and context for libraries/frameworks.

**Use cases:**
- Looking up API documentation
- Checking latest library versions
- Getting code examples from official docs

**Trigger phrases:**
- "Check the documentation for..."
- "What's the latest version of..."
- "Show me examples of using..."

### 2. Sequential Thinking
**Purpose:** Structured problem-solving with step-by-step reasoning.

**Use cases:**
- Complex problem decomposition
- Multi-step debugging
- Architecture decisions
- Planning implementation steps

**Trigger phrases:**
- "Let me think through this step by step"
- "Break down this problem"
- "What's the best approach to..."

### 3. Playwright
**Purpose:** Browser automation and end-to-end testing.

**Use cases:**
- E2E test creation
- Browser automation scripts
- Visual regression testing
- Cross-browser testing

**Trigger phrases:**
- "Write a Playwright test for..."
- "Test this user flow..."
- "Automate this browser action..."

### 4. Chrome DevTools MCP
**Purpose:** Direct browser debugging and performance analysis.

**Use cases:**
- Performance profiling
- Network request debugging
- DOM inspection
- Console log analysis

**Trigger phrases:**
- "Debug this page..."
- "Check performance metrics..."
- "Analyze network requests..."

## Global Configuration

Add to your global Qwen MCP settings (`~/.qwen/mcp.json`):

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-context7"]
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-playwright"]
    },
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-chrome-devtools"]
    }
  }
}
```

## Usage Guidelines

### When to use each MCP:

| Task | Recommended MCP |
|------|-----------------|
| API documentation lookup | Context7 |
| Complex problem solving | Sequential Thinking |
| E2E testing | Playwright |
| Browser debugging | Chrome DevTools |

### Best Practices

1. **Context7**: Use before implementing unfamiliar APIs
2. **Sequential Thinking**: Use for architecture decisions and complex bugs
3. **Playwright**: Write tests for all critical user flows
4. **Chrome DevTools**: Profile performance before optimizing

## Project-Specific Setup

### Playwright Setup

```bash
# Install Playwright
npm install -D @playwright/test
npx playwright install

# Initialize config
npx playwright init
```

### Chrome DevTools Setup

- Ensure Chrome/Chromium is installed
- Enable remote debugging: `chrome.exe --remote-debugging-port=9222`

## Checklist for Development

- [ ] MCP servers configured globally
- [ ] Context7 used for unfamiliar APIs
- [ ] Sequential Thinking for complex decisions
- [ ] Playwright tests for critical flows
- [ ] Chrome DevTools for performance profiling

## Resources

- [MCP Specification](https://modelcontextprotocol.io/)
- [Context7 MCP](https://github.com/modelcontextprotocol/servers/tree/main/src/context7)
- [Sequential Thinking MCP](https://github.com/modelcontextprotocol/servers/tree/main/src/sequential-thinking)
- [Playwright MCP](https://github.com/modelcontextprotocol/servers/tree/main/src/playwright)
- [Chrome DevTools MCP](https://github.com/modelcontextprotocol/servers/tree/main/src/chrome-devtools)
