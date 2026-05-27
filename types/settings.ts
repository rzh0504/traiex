export type Language = "zh-CN" | "en";
export type ThemeMode = "auto" | "light" | "dark";
export type LinkTarget = "_blank" | "_self";
export type BookmarkLayout = "column" | "row";
export type SearchEngineId = "google" | "bing" | "duckduckgo" | "baidu";

export type DockSite = {
  name: string;
  url: string;
  icon?: string;
  svg?: string;
};

export type Bookmark = {
  name: string;
  url: string;
};

export type BookmarkCategory = {
  name: string;
  bookmarks: Bookmark[];
};

export type Settings = {
  showDateTime: boolean;
  showDock: boolean;
  showBookmarks: boolean;
  theme: ThemeMode;
  lightBgColor: string;
  searchBorderRadius: number;
  bookmarksFontWeight: number;
  bookmarkLayout: BookmarkLayout;
  linkTarget: LinkTarget;
  showDockLabels: boolean;
  language: Language;
  searchEngine?: SearchEngineId;
  saveSearchHistory?: boolean;
  maxSearchHistory?: number;
  dockSites: DockSite[] | null;
  bookmarkCategories?: BookmarkCategory[] | null;
};

export type SettingsStorage = Settings & {
  bookmarkCategories: BookmarkCategory[] | null;
  dockSites: DockSite[] | null;
};

export const defaultSettingsBase = {
  showDateTime: true,
  showDock: true,
  showBookmarks: true,
  theme: "auto",
  lightBgColor: "#DDE2EF",
  searchBorderRadius: 20,
  bookmarksFontWeight: 400,
  bookmarkLayout: "column",
  linkTarget: "_blank",
  showDockLabels: false,
  language: "zh-CN",
  dockSites: null,
} satisfies Omit<Settings, "bookmarkCategories">;

export const edgeSettingsDefaults = {
  searchEngine: "google",
  saveSearchHistory: false,
  maxSearchHistory: 10,
} satisfies Required<
  Pick<Settings, "searchEngine" | "saveSearchHistory" | "maxSearchHistory">
>;

export function getDefaultSettings(): Settings {
  if (import.meta.env.BROWSER === "edge") {
    return {
      ...defaultSettingsBase,
      ...edgeSettingsDefaults,
    };
  }

  return {
    ...defaultSettingsBase,
  };
}
