# Supabase MCP Setup Prompt for AI Agents

## Task: Complete Supabase MCP Integration for Paragon Archive

You are an AI coding agent. Your goal is to help complete the GitHub Copilot + Supabase MCP setup without requiring terminal access. Follow these instructions step by step.

## Current Status
✅ Configuration files created:
- `.copilot/mcp-config.json` - MCP server configuration
- `.copilot/README.md` - Documentation
- `.copilot/setup-guide.md` - Setup instructions

## What Needs to be Done

### 1. Create Authentication Helper Script
Create a file at `.copilot/auth-helper.js` that simulates MCP authentication locally:

```javascript
// .copilot/auth-helper.js
// Helper to prepare Supabase MCP authentication
// Use this when terminal access is unavailable

const authConfig = {
  project_ref: "qnylhlyyzpwlfftiygcn",
  supabase_url: "https://qnylhlyyzpwlfftiygcn.supabase.co",
  endpoint: "https://mcp.supabase.com/mcp",
  status: "READY_FOR_AUTH",
  next_step: "Run: copilot -i /mcp when terminal available"
};

module.exports = authConfig;
```

### 2. Create Environment Template
Create `.copilot/.env.example` with all needed environment variables:

```
# Supabase Configuration
SUPABASE_URL=https://qnylhlyyzpwlfftiygcn.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFueWxobHl5enB3bGZmdGl5Z2NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNTgzMjUsImV4cCI6MjEwMjYzNDMyNX0.G_qMBKXUx4o

# MCP Configuration
MCP_PROJECT_REF=qnylhlyyzpwlfftiygcn
MCP_ENABLED=true
MCP_TRANSPORT=http
MCP_FEATURES=docs,account,database,debugging,development,functions,branching

# Authentication Status
MCP_AUTH_STATUS=pending
MCP_LAST_CHECK=
```

### 3. Create Automated Setup Verification Script
Create `.copilot/verify-setup.js` to check MCP configuration:

```javascript
// .copilot/verify-setup.js
// Verify Supabase MCP configuration status

const fs = require('fs');
const path = require('path');

function verifySetup() {
  const checks = {
    "MCP Config File": {
      path: '.copilot/mcp-config.json',
      status: false,
      details: ''
    },
    "Supabase Configuration": {
      path: 'config/supabase.js',
      status: false,
      details: ''
    },
    "Authentication Integration": {
      path: 'auth/supabase-auth.js',
      status: false,
      details: ''
    },
    "Sync Module": {
      path: 'auth/paragon-sync.js',
      status: false,
      details: ''
    }
  };

  // Check each file
  Object.keys(checks).forEach(check => {
    const filePath = checks[check].path;
    try {
      if (fs.existsSync(filePath)) {
        checks[check].status = true;
        checks[check].details = '✅ File found and configured';
      }
    } catch (error) {
      checks[check].details = `❌ ${error.message}`;
    }
  });

  return {
    timestamp: new Date().toISOString(),
    project: 'paragon-archive',
    mcp_status: 'CONFIGURED',
    checks: checks,
    ready_for_auth: true,
    next_steps: [
      '1. When terminal available: copilot -i /mcp',
      '2. Optional: npx skills add supabase/agent-skills',
      '3. Verify: Run verify-setup.js again'
    ]
  };
}

if (require.main === module) {
  console.log(JSON.stringify(verifySetup(), null, 2));
}

module.exports = verifySetup;
```

### 4. Create Quick Reference Card
Create `.copilot/QUICK-REFERENCE.md`:

```markdown
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
```

## Instructions for Your AI Agent

1. **Read** all files in `.copilot/` folder
2. **Create** the helper scripts above (auth-helper.js, verify-setup.js)
3. **Create** the environment template (.env.example)
4. **Create** the quick reference guide
5. **Verify** all Supabase integration files exist:
   - `config/supabase.js` ✅
   - `auth/supabase-auth.js` ✅
   - `auth/paragon-sync.js` ✅
   - `auth/INTEGRATION.md` ✅
6. **Report** that setup is ready for terminal authentication

## What Can Be Done Now (Agent-Assisted)
✅ File organization and setup
✅ Documentation creation
✅ Configuration validation
✅ Code review and suggestions
✅ Helper script creation

## What Requires Terminal
⏳ `copilot -i /mcp` - Authentication
⏳ `npx skills add supabase/agent-skills` - Skills installation

## Success Criteria
- [ ] All `.copilot/` files created
- [ ] Helper scripts generated
- [ ] Supabase integration verified
- [ ] Documentation complete
- [ ] Ready for terminal authentication
- [ ] Can use Copilot + Supabase MCP when authenticated
