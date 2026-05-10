import { Clipboard, getSelectedText, showToast, Toast } from "@raycast/api";
import { openInBloomWithHUD, looksLikePath, resolvePath, pathExists } from "./utils";

export default async function OpenClipboardPathInBloom() {
  let candidate: string | undefined;
  let source = "";

  // 1. Try selected text first
  try {
    const selected = await getSelectedText();
    if (selected && selected.trim().length > 0 && looksLikePath(selected)) {
      candidate = selected.trim();
      source = "selected text";
    }
  } catch {
    // No text selected — fall through
  }

  // 2. Fall back to clipboard
  if (!candidate) {
    try {
      const clip = await Clipboard.readText();
      if (clip && clip.trim().length > 0 && looksLikePath(clip)) {
        candidate = clip.trim();
        source = "clipboard";
      }
    } catch {
      // Clipboard empty or unreadable
    }
  }

  // 3. No valid path found
  if (!candidate) {
    await showToast({
      style: Toast.Style.Failure,
      title: "No path found",
      message:
        "Highlight a file path or copy one to your clipboard, then run this command.",
    });
    return;
  }

  // 4. Resolve and validate
  const resolved = resolvePath(candidate);
  if (!(await pathExists(resolved))) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Path does not exist",
      message: `"${candidate}" (from ${source}) resolved to "${resolved}" but doesn't exist on disk.`,
    });
    return;
  }

  // 5. Open it
  await openInBloomWithHUD(resolved);
}
