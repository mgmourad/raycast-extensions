# Open in Bloom

Open files and folders in [Bloom](https://bloomapp.club/) instead of Finder — directly from Raycast.

## ⚡ Recommended Setup: Fallback Command

The fastest workflow is to register **"Search and Open in Bloom"** as a **Fallback Command**:

1. Open Raycast Preferences (`⌘ + ,`)
2. Go to **Extensions → Fallback Commands**
3. Add **"Search and Open in Bloom"**

Now when you search in Raycast's root search and don't see the file you want, select the fallback — your search query carries over automatically and results open in Bloom with one keystroke.

This gives you **Raycast's native search speed** for apps and commands, with Bloom as the file destination when you need it.

## Commands

### 🔍 Search and Open in Bloom

Search files by name across your Mac (via Spotlight) and open them in Bloom. Supports multi-word queries with AND matching (`doc proj` finds `project-docs.md`).

Works standalone or as a Fallback Command — when used as a fallback, your root search text is pre-filled automatically.

### 📋 Open Clipboard Path in Bloom

Reads a path from your **selected text** first, then falls back to **clipboard**. Resolves `~` and `$HOME`, validates the path exists, opens in Bloom.

Highlight a path in Terminal, a chat, or any app → run this command → done.

### 📂 Open Finder Selection in Bloom

Sends selected Finder items to Bloom. Requires Finder to be the active application.

## Preferences

| Preference | Default | Description |
|---|---|---|
| Bloom Application Name | `Bloom` | The app name used by `open -a`. |

## Requirements

- macOS 14 (Sonoma) or later
- [Bloom](https://bloomapp.club/) installed
- [Raycast](https://raycast.com/) installed
