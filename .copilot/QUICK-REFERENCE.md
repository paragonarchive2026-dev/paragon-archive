# Supabase MCP Quick Reference

## Your Setup Summary
- **Project**: paragon-archive
- **Supabase Ref**: qnylhlyyzpwlfftiygcn
- **Status**: ✅ Configuration Complete
- **Auth Status**: ⏳ Pending Terminal Access

## MCP Features Enabled
- ✅ Database management
- ✅ SQL debugging
- ✅ Function development
- ✅ Schema documentation
- ✅ Account management
- ✅ Branching support

## Using GitHub Codespaces (no laptop)
1. Open the repo in a **Codespace** (Code → Codespaces → Create)
2. In **Copilot Chat**, approve the `supabase` MCP server connection prompt
3. Sign in to Supabase **in the Codespace Browser tab** (not an external browser)
4. Ask in chat: *"What tables are there in the database? Use MCP tools."*

The MCP server config lives in `.vscode/mcp.json` (read by VS Code) —
it's linked automatically when the Codespace opens.

## Required Commands (Terminal Only)
```bash
# Authenticate MCP
copilot -i /mcp

# Install agent skills
npx skills add supabase/agent-skills

# Verify setup
node .copilot/verify-setup.js
```

## API Endpoints
- **MCP Endpoint**: https://mcp.supabase.com/mcp
- **Supabase URL**: https://qnylhlyyzpwlfftiygcn.supabase.co
- **Project Ref**: qnylhlyyzpwlfftiygcn

## Key Files Reference
| File | Purpose |
|------|---------|
| `.copilot/mcp-config.json` | MCP server config |
| `config/supabase.js` | Project credentials |
| `auth/supabase-auth.js` | Auth client |
| `auth/paragon-sync.js` | State sync |
| `auth/INTEGRATION.md` | Auth documentation |

## Troubleshooting
- **Config not found?** → Check `.copilot/mcp-config.json` exists
- **Auth failing?** → Verify Supabase credentials in `config/supabase.js`
- **Skills won't install?** → Ensure Node.js/npm available when terminal opens
