import { getPreferenceValues, showToast, Toast, showHUD } from "@raycast/api";
import { execFile } from "child_process";
import { promisify } from "util";
import { stat } from "fs/promises";
import { homedir } from "os";
import path from "path";

const execFileAsync = promisify(execFile);

interface Preferences {
  bloomAppName: string;
}

export function resolvePath(inputPath: string): string {
  let resolved = inputPath.trim();
  if (resolved.startsWith("~")) {
    resolved = path.join(homedir(), resolved.slice(1));
  }
  resolved = resolved.replace(/\$\{?(\w+)\}?/g, (_, varName: string) => {
    return process.env[varName] || "";
  });
  return path.resolve(resolved);
}

export async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

export function looksLikePath(text: string): boolean {
  const trimmed = text.trim();
  return (
    trimmed.startsWith("/") ||
    trimmed.startsWith("~") ||
    trimmed.startsWith("$HOME") ||
    trimmed.startsWith("./") ||
    trimmed.startsWith("../")
  );
}

export function getBloomAppName(): string {
  const prefs = getPreferenceValues<Preferences>();
  return prefs.bloomAppName || "Bloom";
}

export async function openInBloom(targetPath: string): Promise<boolean> {
  const appName = getBloomAppName();
  const resolved = resolvePath(targetPath);

  if (!(await pathExists(resolved))) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Path not found",
      message: `"${resolved}" does not exist.`,
    });
    return false;
  }

  try {
    await execFileAsync("open", ["-a", appName, resolved]);
    return true;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes("Unable to find application")) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Bloom not found",
        message: `Could not find "${appName}". Check extension preferences.`,
      });
    } else {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to open in Bloom",
        message: msg,
      });
    }
    return false;
  }
}

export async function openInBloomWithHUD(targetPath: string): Promise<void> {
  const resolved = resolvePath(targetPath);
  const success = await openInBloom(resolved);
  if (success) {
    await showHUD(`Opened "${path.basename(resolved)}" in Bloom`);
  }
}
