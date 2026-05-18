export async function queryChromeDefaultSearch(query: string): Promise<boolean> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return false;

  const searchApi = (globalThis as { chrome?: { search?: { query(options: unknown): Promise<void> } } }).chrome
    ?.search;
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
