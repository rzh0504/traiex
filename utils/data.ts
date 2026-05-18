import type { BookmarkCategory, DockSite } from "../types/settings";

export const defaultDockSites: DockSite[] = [
  { name: "GitHub", url: "https://github.com", icon: "/assets/preset_icons/github.svg" },
  { name: "Gmail", url: "https://mail.google.com", icon: "/assets/preset_icons/gmail.svg" },
  { name: "YouTube", url: "https://www.youtube.com", icon: "/assets/preset_icons/youtube.svg" },
  { name: "ChatGPT", url: "https://chat.openai.com", icon: "/assets/preset_icons/openai.svg" },
  { name: "Gemini", url: "https://gemini.google.com", icon: "/assets/preset_icons/gemini.svg" },
  { name: "Claude", url: "https://claude.ai", icon: "/assets/preset_icons/claude.svg" },
];

export const dockSitePresets: DockSite[] = [
  ...defaultDockSites,
  { name: "Vercel", url: "https://vercel.com", icon: "/assets/preset_icons/vercel.svg" },
  { name: "Cloudflare", url: "https://www.cloudflare.com", icon: "/assets/preset_icons/cloudflare.svg" },
  { name: "X", url: "https://x.com", icon: "/assets/preset_icons/x.svg" },
  { name: "Reddit", url: "https://www.reddit.com", icon: "/assets/preset_icons/reddit.svg" },
  { name: "Instagram", url: "https://www.instagram.com", icon: "/assets/preset_icons/Instagram.svg" },
  { name: "Discord", url: "https://discord.com", icon: "/assets/preset_icons/discord.svg" },
  { name: "TikTok", url: "https://www.tiktok.com", icon: "/assets/preset_icons/tiktok.svg" },
  { name: "Netflix", url: "https://www.netflix.com", icon: "/assets/preset_icons/netflix.svg" },
  { name: "Spotify", url: "https://open.spotify.com", icon: "/assets/preset_icons/spotify.svg" },
  { name: "Notion", url: "https://www.notion.so", icon: "/assets/preset_icons/notion.svg" },
  { name: "Google Drive", url: "https://drive.google.com", icon: "/assets/preset_icons/googledrive.svg" },
  { name: "Microsoft", url: "https://www.microsoft.com", icon: "/assets/preset_icons/microsoft.svg" },
  { name: "LinuxDo", url: "https://linux.do", icon: "/assets/preset_icons/linuxdo.svg" },
  { name: "QQ音乐", url: "https://y.qq.com", icon: "/assets/preset_icons/qqmusic.svg" },
  { name: "网易云音乐", url: "https://music.163.com", icon: "/assets/preset_icons/netease.svg" },
  { name: "淘宝", url: "https://www.taobao.com", icon: "/assets/preset_icons/taobao.svg" },
];

export const defaultBookmarkCategories: BookmarkCategory[] = [
  {
    name: "社交",
    bookmarks: [
      { name: "HackerNews", url: "https://news.ycombinator.com" },
      { name: "Reddit", url: "https://www.reddit.com" },
      { name: "Twitter", url: "https://twitter.com" },
    ],
  },
  {
    name: "新闻",
    bookmarks: [
      { name: "Associated Press", url: "https://apnews.com" },
      { name: "Reuters", url: "https://www.reuters.com" },
      { name: "Supercluster", url: "https://www.supercluster.com" },
    ],
  },
  {
    name: "媒体",
    bookmarks: [
      { name: "YouTube", url: "https://www.youtube.com" },
      { name: "Spotify", url: "https://open.spotify.com" },
      { name: "Twitch", url: "https://www.twitch.tv" },
    ],
  },
  {
    name: "工具",
    bookmarks: [
      { name: "GitHub", url: "https://github.com" },
      { name: "Vercel", url: "https://vercel.com" },
      { name: "Gemini", url: "https://gemini.google.com" },
    ],
  },
];

export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
