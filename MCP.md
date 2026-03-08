# MCP Servers

This project uses **MCP (Model Context Protocol)** servers for enhanced AI capabilities.

## Configured Servers

All MCP servers are configured globally in `~/.qwen/mcp.json`.

### 1. Context7
**Package:** `@modelcontextprotocol/server-context7`

**Purpose:** Real-time access to library documentation and API references.

**Use when:**
- Looking up API documentation
- Checking latest library versions
- Getting code examples from official docs
- Understanding unfamiliar libraries

**Example triggers:**
```
"Check the documentation for Zustand"
"Show me examples of using TanStack Query"
"What's the latest Next.js routing API?"
```

---

### 2. Sequential Thinking
**Package:** `@modelcontextprotocol/server-sequential-thinking`

**Purpose:** Structured step-by-step problem solving and reasoning.

**Use when:**
- Breaking down complex problems
- Making architecture decisions
- Multi-step debugging
- Planning implementation

**Example triggers:**
```
"Let me think through this step by step"
"Break down this authentication flow"
"What's the best approach to implement caching?"
```

---

### 3. Playwright
**Package:** `@modelcontextprotocol/server-playwright`

**Purpose:** Browser automation and end-to-end testing.

**Use when:**
- Writing E2E tests
- Automating browser actions
- Visual regression testing
- Cross-browser testing

**Example triggers:**
```
"Write a Playwright test for login flow"
"Test this checkout process"
"Take a screenshot of the dashboard"
```

**Project setup:**
```bash
npm install -D @playwright/test
npx playwright install
npx playwright init
```

---

### 4. Chrome DevTools
**Package:** `@modelcontextprotocol/server-chrome-devtools`

**Purpose:** Direct browser debugging and performance analysis.

**Use when:**
- Performance profiling
- Network request debugging
- DOM inspection
- Console log analysis
- Lighthouse audits

**Example triggers:**
```
"Debug this page performance"
"Check network requests for errors"
"Analyze the DOM structure"
```

**Setup:**
1. Ensure Chrome/Chromium is installed
2. Enable remote debugging: `chrome.exe --remote-debugging-port=9222`

---

## Global Configuration

Location: `~/.qwen/mcp.json`

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

---

## Usage Guidelines

### Development Workflow

```
┌─────────────────────────────────────────────────────────┐
│  1. Context7: Research unfamiliar APIs                  │
│  2. Sequential Thinking: Plan implementation            │
│  3. Implement code (follow Agent Skills)                │
│  4. Playwright: Write E2E tests                         │
│  5. Chrome DevTools: Profile and debug                  │
└─────────────────────────────────────────────────────────┘
```

### When to Use Each

| Task | Recommended MCP |
|------|-----------------|
| API documentation lookup | Context7 |
| Complex problem solving | Sequential Thinking |
| E2E testing | Playwright |
| Browser debugging | Chrome DevTools |
| Performance optimization | Chrome DevTools |
| Architecture planning | Sequential Thinking |

---

## Best Practices

1. **Context7**: Always check documentation before implementing unfamiliar APIs
2. **Sequential Thinking**: Use for complex decisions, not simple tasks
3. **Playwright**: Write tests for all critical user flows
4. **Chrome DevTools**: Profile before optimizing, measure after changes

---

## Checklist for Development

- [ ] MCP servers configured and working
- [ ] Context7 used for unfamiliar APIs
- [ ] Sequential Thinking for complex decisions
- [ ] Playwright tests for critical flows
- [ ] Chrome DevTools for performance profiling

---

## Troubleshooting

### MCP not responding
1. Check `~/.qwen/mcp.json` syntax
2. Restart Qwen Code
3. Verify npx can run: `npx -y @modelcontextprotocol/server-context7 --help`

### Playwright errors
```bash
# Reinstall browsers
npx playwright install --force

# Check installation
npx playwright test --list
```

### Chrome DevTools connection failed
1. Close all Chrome instances
2. Start Chrome with remote debugging:
   ```
   chrome.exe --remote-debugging-port=9222
   ```
3. Verify connection: `http://localhost:9222/json`

---

## Resources

- [MCP Specification](https://modelcontextprotocol.io/)
- [MCP Servers Repository](https://github.com/modelcontextprotocol/servers)
- [Context7 Documentation](https://github.com/modelcontextprotocol/servers/tree/main/src/context7)
- [Sequential Thinking](https://github.com/modelcontextprotocol/servers/tree/main/src/sequential-thinking)
- [Playwright MCP](https://github.com/modelcontextprotocol/servers/tree/main/src/playwright)
- [Chrome DevTools MCP](https://github.com/modelcontextprotocol/servers/tree/main/src/chrome-devtools)
