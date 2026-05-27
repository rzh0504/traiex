import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-vue"],
  manifest: ({ browser }) => ({
    name: "traiex",
    version: "1.1.0",
    description:
      browser === "edge"
        ? "Minimal Microsoft Edge new tab page with search, bookmarks, quick links, themes, and syncable settings."
        : "Minimal Chrome new tab page with default search, bookmarks, quick links, themes, and syncable settings.",
    icons: {
      16: "/favicon-16x16.png",
      32: "/favicon-32x32.png",
      48: "/favicon-48x48.png",
      128: "/favicon-128x128.png",
    },
    permissions: browser === "edge" ? ["storage"] : ["storage", "search"],
  }),
});
