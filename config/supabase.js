/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: supabase.js
  EXPECTED PROJECT PATH: /config/supabase.js
  ROLE: Public Supabase project configuration.
  RESTORE/LOAD NOTE: Restore under config/. Load before auth/supabase-auth.js.
*/
/*
  PARAGON ARCHIVE — PUBLIC SUPABASE CONFIGURATION

  The anon key is designed to be public in browser applications. Security must
  come from Supabase Row Level Security policies, not from hiding this file.
*/
window.ParagonConfig = {
  supabaseUrl: "https://qnylhlyyzpwlfftiygcn.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFueWxobHl5enB3bGZmdGl5Z2NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNTgzMjUsImV4cCI6MjEwMjYzNDMyNX0.G_qMBKXUx4o-0-yT7-w77R5UIsZVIMFpBRDt79n-0NE",

  // All Paragon products are expected to use routes under this same origin.
  siteBasePath: "/",

  // Leave empty to use the current origin + current path for OAuth callbacks.
  authRedirectUrl: "",

  // Supabase table created by supabase/schema.sql.
  userStateTable: "paragon_user_state",

  // Public identifier only. The creator password must never be placed in front-end code.
  creatorDemoEmail: "paragon.archive.2026@gmail.com",

  // P-096 — Web Push VAPID public key (NOT secret). Empty until the production domain +
  // push sender exist; pwa.js shows an honest "activates later" state while empty.
  pushPublicKey: "",

  // Future protected AI backend route. Keep empty until a server/Edge endpoint is deployed.
  // Provider/model API keys must live only in server secrets, never in this browser config.
  aiEndpoint: "",
  aiEnabled: false
};
