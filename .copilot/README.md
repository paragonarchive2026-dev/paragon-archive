# GitHub Copilot Configuration

This folder contains configuration for GitHub Copilot integrations with your Paragon Archive project.

## Files

### `mcp.json` (in `.vscode/`)
Workspace MCP config read by VS Code / GitHub Codespace. Auto-links the
Supabase MCP server when the repo opens in Codespaces — approve the prompt in
Copilot Chat and sign in via the Codespace Browser tab.

### `mcp-config.json`
Model Context Protocol (MCP) server configuration for Supabase integration.

**What it does:**
- Connects Copilot to your Supabase project
- Enables AI-assisted database operations
- Provides schema awareness and SQL suggestions
- Allows Copilot to understand your database structure

**Supabase Project Details:**
```
Project Reference: qnylhlyyzpwlfftiygcn
Region: Auto-detected
Features: Database, Functions, Debugging, Development, Branching, Docs, Account
```

## Quick Links

- 📖 [Setup Guide](./setup-guide.md) - Step-by-step instructions
- 🔐 [Supabase Config](../config/supabase.js) - Project credentials
- 🗄️ [Database Schema](../supabase/schema.sql) - Database structure
- 📚 [Auth Integration](../auth/INTEGRATION.md) - Authentication setup

## Status

| Component | Status |
|-----------|--------|
| MCP Config (`.copilot/`) | ✅ Configured |
| VS Code MCP Config (`.vscode/mcp.json`) | ✅ Configured |
| Supabase Link | ✅ Connected |
| Authentication | ⏳ Pending — approve in Copilot Chat inside a GitHub Codespace |
| Agent Skills | ⏳ Optional |

## Need Help?

1. **Configuration Issues?** → Check [setup-guide.md](./setup-guide.md)
2. **Supabase Questions?** → See [../auth/INTEGRATION.md](../auth/INTEGRATION.md)
3. **GitHub Copilot Docs?** → Visit [docs.github.com/copilot](https://docs.github.com/en/copilot)
