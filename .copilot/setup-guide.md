# Supabase MCP Setup Guide

This guide helps you complete the Supabase Model Context Protocol (MCP) setup for GitHub Copilot.

## ✅ What's Already Done
- `mcp-config.json` has been created in this folder
- Supabase project is linked: `qnylhlyyzpwlfftiygcn`

## 🔧 What You Need to Do (When You Have Terminal Access)

### Step 1: Authenticate the MCP
Run this command in your terminal:
```bash
copilot -i /mcp
```

Follow the on-screen instructions to complete authentication.

### Step 2: Install Agent Skills (Optional but Recommended)
```bash
npx skills add supabase/agent-skills
```

This gives Copilot specialized knowledge for working with Supabase.

## 📋 Repository Setup Checklist

- [x] MCP Configuration file created
- [ ] Terminal authentication completed (`copilot -i /mcp`)
- [ ] Agent Skills installed (`npx skills add supabase/agent-skills`)
- [ ] Supabase credentials configured in `config/supabase.js`
- [ ] Authentication tested

## 🔐 Supabase Configuration

Your project is already linked in `config/supabase.js`:
- **Project URL**: `https://qnylhlyyzpwlfftiygcn.supabase.co`
- **Anon Key**: Stored in `config/supabase.js`
- **Features Enabled**: docs, account, database, debugging, development, functions, branching

## 📖 Documentation
- [GitHub Copilot MCP Docs](https://docs.github.com/en/copilot/managing-copilot/configure-personal-settings/configuring-your-copilot-settings)
- [Supabase MCP Documentation](https://mcp.supabase.com)

## ❓ Troubleshooting

**Issue**: "Supabase is not configured"
- **Solution**: Ensure `config/supabase.js` has valid credentials

**Issue**: MCP not connecting
- **Solution**: Run `copilot -i /mcp` to authenticate

**Issue**: Agent Skills won't install
- **Solution**: Ensure you have Node.js and npm installed locally
