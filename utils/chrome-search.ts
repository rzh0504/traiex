function isMobileBrowser(): boolean {
  const navigatorLike = globalThis.navigator as
    | (Navigator & { userAgentData?: { mobile?: boolean } })
    | undefined;

  if (navigatorLike?.userAgentData?.mobile) return true;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(
    navigatorLike?.userAgent ?? "",
  );
}

function buildFallbackSearchUrl(query: string): string {
  const url = new URL("https://www.google.com/search");
  url.searchParams.set("q", query);
  return url.toString();
}

export async function queryChromeDefaultSearch(
  query: string,
): Promise<boolean> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return false;

  if (isMobileBrowser()) {
    globalThis.location.assign(buildFallbackSearchUrl(trimmedQuery));
    return true;
  }

  const searchApi = (
    globalThis as {
      chrome?: { search?: { query(options: unknown): Promise<void> } };
    }
  ).chrome?.search;
  if (!searchApi?.query) {
    console.error("Chrome Search API is unavailable.");
    return false;
  }

  try {
    await searchApi.query({
      text: trimmedQuery,
      disposition: "CURRENT_TAB",
    });
    return true;
  } catch (error) {
    console.error("Failed to search via Chrome default provider:", error);
    return false;
  }
}
