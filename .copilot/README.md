# GitHub Copilot Configuration

This folder contains configuration for GitHub Copilot integrations with your Paragon Archive project.

## Files

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
| MCP Config | ✅ Configured |
| Supabase Link | ✅ Connected |
| Local Authentication | ⏳ Pending (run `copilot -i /mcp`) |
| Agent Skills | ⏳ Optional |

## Need Help?

1. **Configuration Issues?** → Check [setup-guide.md](./setup-guide.md)
2. **Supabase Questions?** → See [../auth/INTEGRATION.md](../auth/INTEGRATION.md)
3. **GitHub Copilot Docs?** → Visit [docs.github.com/copilot](https://docs.github.com/en/copilot)
