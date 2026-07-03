# Project Rules: Windows Script Execution Policy Bypass

On this environment (Windows), the user's PowerShell script execution policy blocks standard `.ps1` wrapper script files (such as `npm.ps1` or `npx.ps1`), throwing `PSSecurityException` / `UnauthorizedAccess` errors when calling standard commands like `npm run dev` or `npx`.

To avoid this, follow these rules:
1. **Always use `npm.cmd` instead of `npm`** for all frontend and package commands (e.g., `npm.cmd run dev`, `npm.cmd install`).
2. **Always use `npx.cmd` instead of `npx`** if running any npx commands.
3. Ensure any helper scripts or batch launchers (like `start.bat`) explicitly execute `.cmd` variants.
