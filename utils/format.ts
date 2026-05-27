const GOOGLE_FAVICON_HOSTS = ["t0", "t1", "t2", "t3"] as const;
const FAVICON_SIZE = 64;

function getStableHostIndex(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash + value.charCodeAt(index)) % GOOGLE_FAVICON_HOSTS.length;
  }
  return hash;
}

export function getFaviconUrl(url: string): string {
  try {
    const targetUrl = new URL(url);
    const faviconHost = GOOGLE_FAVICON_HOSTS[getStableHostIndex(targetUrl.hostname)];
    const faviconUrl = new URL(`https://${faviconHost}.gstatic.com/faviconV2`);
    faviconUrl.searchParams.set("client", "SOCIAL");
    faviconUrl.searchParams.set("type", "FAVICON");
    faviconUrl.searchParams.set("fallback_opts", "TYPE,SIZE,URL");
    faviconUrl.searchParams.set("url", targetUrl.origin);
    faviconUrl.searchParams.set("size", String(FAVICON_SIZE));
    return faviconUrl.toString();
  } catch {
    return "";
  }
}

export function getDuckDuckGoFaviconUrl(url: string): string {
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
