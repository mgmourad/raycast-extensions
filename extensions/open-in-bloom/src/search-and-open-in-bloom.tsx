import { List, ActionPanel, Action, Icon, LaunchProps, showToast, Toast } from "@raycast/api";
import { useState, useRef, useCallback, useEffect } from "react";
import { execFile } from "child_process";
import { promisify } from "util";
import { stat } from "fs/promises";
import path from "path";
import { openInBloom } from "./utils";

const execFileAsync = promisify(execFile);

/**
 * Search and Open in Bloom
 *
 * This command serves two roles:
 *
 * 1. STANDALONE: A simple file search (via mdfind) where the primary action
 *    is "Open in Bloom" instead of "Open in Finder."
 *
 * 2. FALLBACK COMMAND: Register this as a Raycast Fallback Command
 *    (Preferences → Extensions → Fallback Commands). When you search in
 *    Raycast's root search and no command matches, this command receives
 *    your search text via `fallbackText` and immediately searches for files.
 *
 *    This way you get Raycast's blazing-fast native search for commands/apps,
 *    and when you're looking for a file, it falls through to this command
 *    which opens results in Bloom.
 *
 * The UX flow:
 *   - Type in Raycast → native search shows apps/commands
 *   - Don't see what you want? Select "Search and Open in Bloom" from fallbacks
 *   - Your query is pre-filled → results show instantly → Enter opens in Bloom
 */

interface SearchResult {
  name: string;
  path: string;
  isDirectory: boolean;
  extension: string;
}

export default function SearchAndOpenInBloom(props: LaunchProps) {
  // If launched as a fallback command, Raycast passes the root search text
  const initialQuery = props.fallbackText || "";

  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const performSearch = useCallback(async (query: string) => {
    if (!query || query.trim().length === 0) {
      setResults([]);
      setHasSearched(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const terms = query.trim().split(/\s+/).filter(Boolean);
      let args: string[];

      if (terms.length === 1) {
        args = ["-name", terms[0]];
      } else {
        // Multi-term AND matching via Spotlight predicates
        const predicates = terms.map(
          (term) =>
            `kMDItemFSName == "*${term.replace(/"/g, '\\"')}*"cd`
        );
        args = [predicates.join(" && ")];
      }

      const { stdout } = await execFileAsync("mdfind", args, {
        timeout: 5000,
        maxBuffer: 1024 * 1024,
      });

      const lines = stdout
        .split("\n")
        .filter((line) => line.trim().length > 0)
        .slice(0, 50);

      // Parallel stat for accurate directory detection
      const items: SearchResult[] = await Promise.all(
        lines.map(async (filePath) => {
          const name = path.basename(filePath);
          let isDir = false;
          try {
            const stats = await stat(filePath);
            isDir = stats.isDirectory();
          } catch {
            // keep default
          }
          return {
            name,
            path: filePath,
            isDirectory: isDir,
            extension: isDir ? "" : path.extname(name).toLowerCase(),
          };
        })
      );

      setResults(items);
      setHasSearched(true);
    } catch {
      setResults([]);
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onSearchTextChange = useCallback(
    (text: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (!text || text.trim().length === 0) {
        setResults([]);
        setHasSearched(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      debounceRef.current = setTimeout(() => performSearch(text), 250);
    },
    [performSearch]
  );

  // If we received fallbackText, search immediately on mount
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, []);

  const homePath = process.env.HOME || "/Users";
  const shortenPath = (p: string) => {
    const dir = path.dirname(p);
    return dir.startsWith(homePath) ? dir.replace(homePath, "~") : dir;
  };

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Search files to open in Bloom…"
      defaultSearchText={initialQuery}
      onSearchTextChange={onSearchTextChange}
      throttle
    >
      {!hasSearched && results.length === 0 && (
        <List.EmptyView
          icon={Icon.MagnifyingGlass}
          title="Type to search"
          description={
            "Tip: Set this as a Fallback Command in Raycast Preferences\n" +
            "so your root search queries automatically fall through here."
          }
        />
      )}

      {hasSearched && results.length === 0 && (
        <List.EmptyView
          icon={Icon.XMarkCircle}
          title="No results found"
          description="Try a different search term."
        />
      )}

      {results.map((result) => (
        <List.Item
          key={result.path}
          icon={result.isDirectory ? Icon.Folder : Icon.Document}
          title={result.name}
          subtitle={shortenPath(result.path)}
          accessories={
            result.extension
              ? [{ tag: result.extension.replace(".", "").toUpperCase() }]
              : []
          }
          actions={
            <ActionPanel>
              <ActionPanel.Section title="Bloom">
                <Action
                  title="Open in Bloom"
                  icon={Icon.Finder}
                  onAction={async () => {
                    await openInBloom(result.path);
                  }}
                />
                <Action
                  title="Open Containing Folder in Bloom"
                  icon={Icon.Folder}
                  shortcut={{ modifiers: ["cmd", "shift"], key: "o" }}
                  onAction={async () => {
                    await openInBloom(path.dirname(result.path));
                  }}
                />
              </ActionPanel.Section>
              <ActionPanel.Section title="System">
                <Action.ShowInFinder path={result.path} />
                <Action.OpenWith path={result.path} />
                <Action.CopyToClipboard
                  title="Copy Path"
                  content={result.path}
                  shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
                />
              </ActionPanel.Section>
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
