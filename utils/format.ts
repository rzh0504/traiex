export function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
  } catch {
    return "";
  }
}

export function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

export function normalizeUrl(value: string): string | null {
  const input = value.trim();
  if (!input) return null;
  const url = input.startsWith("http://") || input.startsWith("https://") ? input : `https://${input}`;

  try {
    return new URL(url).toString();
  } catch {
    return null;
  }
}
