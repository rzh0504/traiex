import type { BookmarkCategory, LinkTarget, SearchEngineId, Settings } from "../types/settings";
import { appStorage } from "./storage";

export const searchEngines: Record<SearchEngineId, { name: string; url: string; param: string }> = {
  google: { name: "Google", url: "https://www.google.com/search", param: "q" },
  bing: { name: "Bing", url: "https://www.bing.com/search", param: "q" },
  duckduckgo: { name: "DuckDuckGo", url: "https://duckduckgo.com/", param: "q" },
  baidu: { name: "百度", url: "https://www.baidu.com/s", param: "wd" },
};

export type SearchSuggestion = {
  type: "history" | "bookmark";
  text: string;
  url?: string;
  matchIndex: number;
  matchLength: number;
};

export function navigateToUrl(url: string, target: LinkTarget): void {
  if (target === "_self") {
    window.location.assign(url);
    return;
  }
  window.open(url, target, "noopener");
}

export function buildSearchUrl(searchEngine: SearchEngineId | undefined, query: string): string {
  const engine = searchEngines[searchEngine ?? "google"] ?? searchEngines.google;
  const url = new URL(engine.url);
  url.searchParams.set(engine.param, query);
  return url.toString();
}

export async function getSearchHistory(): Promise<string[]> {
  try {
    const result = await appStorage.local.get("searchHistory");
    return Array.isArray(result.searchHistory) ? (result.searchHistory as string[]) : [];
  } catch {
    return [];
  }
}

export async function saveSearchToHistory(
  query: string,
  settings: Pick<Settings, "saveSearchHistory" | "maxSearchHistory">,
): Promise<void> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery || !settings.saveSearchHistory) return;

  try {
    let history = await getSearchHistory();
    history = history.filter((item) => item !== trimmedQuery);
    history.unshift(trimmedQuery);
    history = history.slice(0, settings.maxSearchHistory || 10);
    await appStorage.local.set({ searchHistory: history });
  } catch (error) {
    console.error("Failed to save search history:", error);
  }
}

export async function clearSearchHistory(): Promise<void> {
  await appStorage.local.remove("searchHistory");
}

export async function getLocalSearchMatches(
  query: string,
  settings: Pick<Settings, "saveSearchHistory">,
  categories: BookmarkCategory[],
): Promise<SearchSuggestion[]> {
  const lowerQuery = query.toLowerCase();
  const results: SearchSuggestion[] = [];

  if (settings.saveSearchHistory) {
    const history = await getSearchHistory();
    history.forEach((item) => {
      const matchIndex = item.toLowerCase().indexOf(lowerQuery);
      if (matchIndex !== -1) {
        results.push({
          type: "history",
          text: item,
          matchIndex,
          matchLength: query.length,
        });
      }
    });
  }

  categories.forEach((category) => {
    category.bookmarks.forEach((bookmark) => {
      const nameMatch = bookmark.name.toLowerCase().indexOf(lowerQuery);
      const urlMatch = bookmark.url.toLowerCase().indexOf(lowerQuery);
      if (nameMatch !== -1 || urlMatch !== -1) {
        results.push({
          type: "bookmark",
          text: bookmark.name,
          url: bookmark.url,
          matchIndex: nameMatch,
          matchLength: query.length,
        });
      }
    });
  });

  return results
    .sort((a, b) => {
      const aExact = a.text.toLowerCase() === lowerQuery;
      const bExact = b.text.toLowerCase() === lowerQuery;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      if (a.type === "history" && b.type !== "history") return -1;
      if (a.type !== "history" && b.type === "history") return 1;
      if (a.matchIndex === -1) return 1;
      if (b.matchIndex === -1) return -1;
      return a.matchIndex - b.matchIndex;
    })
    .slice(0, 10);
}
