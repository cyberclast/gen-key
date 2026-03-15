# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Lint all JS files
npm run lint

# Package the extension into a .vsix file
npx vsce package

# Install the extension locally for testing
code --install-extension gen-key-*.vsix
```

There are no automated tests — manual testing is done by installing the extension in VS Code via F5 (Run Extension) in the Extension Development Host.

## Architecture

This is a VS Code extension with three source files:

- **`extension.js`** — Entry point. Registers the four commands (`gen-key.generateHex`, `gen-key.generateBase31`, `gen-key.generateBase64Url`, `gen-key.generatePassword`) and wires them to `keyGenerator.js` and `StatusBarManager`. Each command follows the same toggle pattern: if the clipboard still contains the last generated value, clear it; otherwise generate a new value and copy it to the clipboard.

- **`keyGenerator.js`** — Pure crypto logic (no VS Code dependencies). Uses Node.js `crypto.randomBytes()` and `crypto.randomInt()` for all generation. Base31 uses rejection sampling (discards bytes > 30) against a 31-character alphabet that omits visually ambiguous characters (no I, L, O, 1, 0). Password generation guarantees at least one character from each enabled set, then shuffles with Fisher-Yates.

- **`statusBar.js`** — `StatusBarManager` class owns four `StatusBarItem` buttons and a 500ms clipboard polling interval. When a generated value is detected in the clipboard, it starts a 250ms pulse animation that alternates the button background between `statusBarItem.errorBackground` (red) and default. Clicking the button again clears the clipboard via the command handler in `extension.js`.

### Key design details

- The extension activates on `onStartupFinished` (always active, low overhead).
- Button visibility is controlled per-button via `gen-key.{hex,base31,base64url,password}.enabled` settings.
- Password button is additionally hidden if all character set options are disabled; this state is also surfaced as a VS Code diagnostic warning.
- `StatusBarManager` implements `dispose()` and is registered in `context.subscriptions` for proper cleanup.
