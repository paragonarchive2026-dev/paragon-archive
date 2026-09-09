# Supabase MCP Setup Guide

This guide helps you complete the Supabase Model Context Protocol (MCP) setup for GitHub Copilot.

## ✅ What's Already Done
- `mcp-config.json` has been created in this folder
- Supabase project is linked: `qnylhlyyzpwlfftiygcn`

## 💻 Using GitHub Codespaces (No Laptop Needed)

GitHub Codespaces gives you a full VS Code **with a terminal** in your browser,
so every step below can be done from your phone or any browser.

1. **Open the repo in Codespaces** — on the repo page, click `<> Code` →
   **Codespaces** tab → **Create codespace**.
2. **Connect the MCP server** — when the Codespace opens, VS Code detects
   `.vscode/mcp.json` automatically. Open **Copilot Chat** (`@`/chat icon) and
   you'll see a prompt to connect the `supabase` MCP server ("New tool
   available"). Click it to connect.
3. **Log in to Supabase** — VS Code opens a browser tab (the **Browser** tab
   in Codespaces). Sign in to your Supabase account and authorize access.
   ⚠️ Do this *inside the Codespace's Browser tab*, not an external browser —
   the sign-in redirect goes back to the Codespace's local port.
4. **Verify** — in Copilot Chat ask: *"What tables are there in the database?
   Use MCP tools."* You should get a list from your Supabase project.

> The terminal is available anytime: click **Terminal** in the top menu bar
> (or the terminal icon, top-right). You can also verify the config with:
> ```bash
> node .copilot/verify-setup.js
> ```

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
