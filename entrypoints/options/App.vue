<template>
  <main>
    <div class="settings-container">
      <div class="settings-layout">
        <aside class="settings-sidebar" aria-label="Settings navigation">
          <nav class="settings-nav">
            <a href="#display-settings" class="settings-nav-item" :class="{ active: activeSection === 'display-settings' }" @click.prevent="activeSection = 'display-settings'">{{ t("display") }}</a>
            <a v-if="isEdgeBuild" href="#search-settings" class="settings-nav-item" :class="{ active: activeSection === 'search-settings' }" @click.prevent="activeSection = 'search-settings'">{{ t("search") }}</a>
            <a href="#appearance-settings" class="settings-nav-item" :class="{ active: activeSection === 'appearance-settings' }" @click.prevent="activeSection = 'appearance-settings'">{{ t("appearance") }}</a>
            <a href="#dock-settings" class="settings-nav-item" :class="{ active: activeSection === 'dock-settings' }" @click.prevent="activeSection = 'dock-settings'">{{ t("dock_settings") }}</a>
            <a href="#bookmark-settings" class="settings-nav-item" :class="{ active: activeSection === 'bookmark-settings' }" @click.prevent="activeSection = 'bookmark-settings'">{{ t("bookmark_categories") }}</a>
            <a href="#data-settings" class="settings-nav-item" :class="{ active: activeSection === 'data-settings' }" @click.prevent="activeSection = 'data-settings'">{{ t("data_management") }}</a>
          </nav>
        </aside>

        <form id="settings-form" class="settings-content" @submit.prevent="saveSettings">
          <section v-show="activeSection === 'display-settings'" id="display-settings" class="settings-section">
            <div class="settings-section-header">
              <h2>{{ t("display") }}</h2>
              <button type="submit" class="save-btn">
                <span class="btn-text">{{ t("save_settings") }}</span>
                <span class="btn-icon">✓</span>
              </button>
            </div>

          <div class="setting-item">
            <div class="setting-info">
              <label for="language">{{ t("language") }}</label>
              <span class="setting-description">{{ t("language_desc") }}</span>
            </div>
            <select id="language" v-model="settings.language">
              <option value="zh-CN">中文</option>
              <option value="en">English</option>
            </select>
          </div>

          <SettingToggle id="showDateTime" v-model="settings.showDateTime" :label="t('show_datetime')" :description="t('show_datetime_desc')" />
          <SettingToggle id="showDock" v-model="settings.showDock" :label="t('show_dock')" :description="t('show_dock_desc')" />
          <SettingToggle id="showBookmarks" v-model="settings.showBookmarks" :label="t('show_bookmarks')" :description="t('show_bookmarks_desc')" />

          <div v-if="!isEdgeBuild" class="setting-item">
            <div class="setting-info">
              <label>{{ t("search_provider") }}</label>
              <span class="setting-description">{{ t("search_provider_desc") }}</span>
            </div>
            <span class="setting-description">{{ t("chrome_default_search") }}</span>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label for="linkTarget">{{ t("link_target") }}</label>
              <span class="setting-description">{{ t("link_target_desc") }}</span>
            </div>
            <select id="linkTarget" v-model="settings.linkTarget">
              <option value="_blank">{{ t("new_tab") }}</option>
              <option value="_self">{{ t("current_tab") }}</option>
            </select>
          </div>
        </section>

          <section v-if="isEdgeBuild" v-show="activeSection === 'search-settings'" id="search-settings" class="settings-section">
            <div class="settings-section-header">
              <h2>{{ t("search") }}</h2>
              <button type="submit" class="save-btn">
                <span class="btn-text">{{ t("save_settings") }}</span>
                <span class="btn-icon">✓</span>
              </button>
            </div>

          <div class="setting-item">
            <div class="setting-info">
              <label for="searchEngine">{{ t("search_engine") }}</label>
              <span class="setting-description">{{ t("search_engine_desc") }}</span>
            </div>
            <select id="searchEngine" v-model="settings.searchEngine">
              <option value="google">Google</option>
              <option value="bing">Bing</option>
              <option value="duckduckgo">DuckDuckGo</option>
              <option value="baidu">百度</option>
            </select>
          </div>

          <SettingToggle
            id="saveSearchHistory"
            :model-value="settings.saveSearchHistory ?? false"
            @update:model-value="settings.saveSearchHistory = $event"
            :label="t('save_search_history')"
            :description="t('save_search_history_desc')"
          />

          <div v-show="settings.saveSearchHistory" class="setting-item" id="maxSearchHistorySection">
            <div class="setting-info">
              <label for="maxSearchHistory">{{ t("max_search_history") }}</label>
              <span class="setting-description">{{ t("max_search_history_desc") }}</span>
            </div>
            <select id="maxSearchHistory" v-model.number="settings.maxSearchHistory">
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
          </div>

          <div v-show="settings.saveSearchHistory" class="setting-item" id="clearSearchHistorySection">
            <div class="setting-info">
              <label>{{ t("clear_search_history") }}</label>
              <span class="setting-description">{{ t("clear_search_history_desc") }}</span>
            </div>
            <button type="button" class="reset-btn" id="clearSearchHistoryBtn" @click="clearHistory">{{ t("clear") }}</button>
          </div>
        </section>

          <section v-show="activeSection === 'appearance-settings'" id="appearance-settings" class="settings-section">
            <div class="settings-section-header">
              <h2>{{ t("appearance") }}</h2>
              <button type="submit" class="save-btn">
                <span class="btn-text">{{ t("save_settings") }}</span>
                <span class="btn-icon">✓</span>
              </button>
            </div>

          <div class="setting-item">
            <div class="setting-info">
              <label for="theme">{{ t("theme") }}</label>
              <span class="setting-description">{{ t("theme_desc") }}</span>
            </div>
            <select id="theme" v-model="settings.theme">
              <option value="auto">{{ t("theme_auto") }}</option>
              <option value="light">{{ t("theme_light") }}</option>
              <option value="dark">{{ t("theme_dark") }}</option>
            </select>
          </div>

          <div class="setting-item setting-item-column" id="bgColorSection">
            <div class="setting-info">
              <label>{{ t("light_bg_color") }}</label>
              <span class="setting-description">{{ t("light_bg_color_desc") }}</span>
            </div>
            <div class="color-options">
              <div class="color-presets">
                <button
                  v-for="preset in colorPresets"
                  :key="preset.color"
                  type="button"
                  class="color-preset"
                  :class="{ selected: preset.color.toUpperCase() === settings.lightBgColor.toUpperCase() }"
                  :data-color="preset.color"
                  :style="{ backgroundColor: preset.color }"
                  :title="t(preset.titleKey)"
                  @click="settings.lightBgColor = preset.color"
                ></button>
              </div>
              <div class="color-custom">
                <label for="lightBgColor" class="color-custom-label">{{ t("custom") }}</label>
                <input id="lightBgColor" v-model="settings.lightBgColor" type="color" class="color-input" />
                <span class="color-value" id="colorValue">{{ settings.lightBgColor.toUpperCase() }}</span>
              </div>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label for="searchBorderRadius">{{ t("search_border_radius") }}</label>
              <span class="setting-description">{{ t("search_border_radius_desc") }}</span>
            </div>
            <div class="range-control">
              <input
                id="searchBorderRadius"
                v-model.number="settings.searchBorderRadius"
                type="range"
                min="0"
                max="50"
                class="range-input"
              />
              <span class="range-value" id="borderRadiusValue">{{ settings.searchBorderRadius }}px</span>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label for="bookmarksFontWeight">{{ t("bookmarks_font_weight") }}</label>
              <span class="setting-description">{{ t("bookmarks_font_weight_desc") }}</span>
            </div>
            <select id="bookmarksFontWeight" v-model.number="settings.bookmarksFontWeight">
              <option :value="400">{{ t("font_regular") }} (400)</option>
              <option :value="500">{{ t("font_medium") }} (500)</option>
              <option :value="700">{{ t("font_bold") }} (700)</option>
            </select>
          </div>
        </section>

          <section v-show="activeSection === 'dock-settings'" id="dock-settings" class="settings-section">
            <div class="settings-section-header">
              <h2>{{ t("dock_settings") }}</h2>
              <button type="submit" class="save-btn">
                <span class="btn-text">{{ t("save_settings") }}</span>
                <span class="btn-icon">✓</span>
              </button>
            </div>
          <SettingToggle id="showDockLabels" v-model="settings.showDockLabels" :label="t('show_dock_labels')" :description="t('show_dock_labels_desc')" />

          <div class="setting-item">
            <div class="setting-info">
              <label>{{ t("manage_dock") }}</label>
              <span class="setting-description">{{ t("manage_dock_desc") }}</span>
            </div>
          </div>

          <div class="dock-manager">
            <div id="active-dock-sites" class="active-dock-sites">
              <div v-if="currentDockSites.length === 0" class="bookmarks-empty">{{ t("no_sites") }}</div>
              <div
                v-for="(site, index) in currentDockSites"
                v-else
                :key="site.url"
                class="dock-site-item"
                :class="{ dragging: dockDragIndex === index, 'drag-over': dockDropIndex === index }"
                :title="t('drag_to_sort_remove_site', { name: site.name })"
                :data-index="index"
                draggable="true"
                @dragstart="startDockManagerDrag(index)"
                @dragover.prevent="dockDropIndex = index"
                @dragleave="dockDropIndex = null"
                @drop.prevent="dropDockManager(index)"
                @dragend="endDockManagerDrag"
                @click="removeDockSite(index)"
              >
                <img v-if="site.icon" :src="site.icon" :alt="site.name" class="dock-icon" />
              </div>
            </div>

            <h3 class="subsection-title">{{ t("available_presets") }}</h3>
            <div id="preset-dock-sites" class="preset-dock-sites">
              <div v-if="availablePresets.length === 0" class="bookmarks-empty">{{ t("all_presets_added") }}</div>
              <div
                v-for="preset in availablePresets"
                v-else
                :key="preset.url"
                class="dock-site-item"
                :title="t('add_site', { name: preset.name })"
                @click="addDockSite(preset)"
              >
                <img v-if="preset.icon" :src="preset.icon" :alt="preset.name" class="dock-icon" />
              </div>
            </div>
          </div>
        </section>

          <section v-show="activeSection === 'bookmark-settings'" id="bookmark-settings" class="settings-section">
            <div class="settings-section-header">
              <h2>{{ t("bookmark_categories") }}</h2>
              <button type="submit" class="save-btn">
                <span class="btn-text">{{ t("save_settings") }}</span>
                <span class="btn-icon">✓</span>
              </button>
            </div>

          <div class="bookmark-categories" id="bookmark-categories">
            <div
              v-for="(category, catIndex) in bookmarkCategories"
              :key="catIndex"
              class="bookmark-category"
              :class="{ dragging: categoryDragIndex === catIndex, 'drag-over': categoryDropIndex === catIndex }"
              :data-cat-index="catIndex"
              draggable="true"
              @dragstart="startCategoryDrag(catIndex)"
              @dragover.prevent="categoryDropIndex = catIndex"
              @dragleave="categoryDropIndex = null"
              @drop.prevent="dropCategory(catIndex)"
              @dragend="endCategoryDrag"
            >
              <div class="category-header">
                <span class="drag-handle" :title="t('drag_to_sort')">⋮⋮</span>
                <input
                  v-model="category.name"
                  type="text"
                  class="category-name-input"
                  :data-cat-index="catIndex"
                  :placeholder="t('category_name_placeholder')"
                />
                <button
                  v-if="canDeleteCategory"
                  type="button"
                  class="delete-category-btn"
                  :data-cat-index="catIndex"
                  :title="t('delete_category')"
                  @click="deleteCategory(catIndex)"
                >
                  ×
                </button>
              </div>

              <div class="category-bookmarks" :data-cat-index="catIndex">
                <div v-if="category.bookmarks.length === 0" class="bookmarks-empty">{{ t("no_bookmarks") }}</div>
                <div v-for="(bookmark, bookmarkIndex) in category.bookmarks" :key="bookmark.url" class="bookmark-item">
                  <img class="favicon" :src="getFaviconUrl(bookmark.url)" alt="" @error="hideBrokenImage" />
                  <span class="bookmark-name">{{ bookmark.name }}</span>
                  <span class="bookmark-url">{{ bookmark.url }}</span>
                  <button
                    type="button"
                    class="delete-btn"
                    :data-cat-index="catIndex"
                    :data-bookmark-index="bookmarkIndex"
                    :title="t('delete_item')"
                    @click="deleteBookmark(catIndex, bookmarkIndex)"
                  >
                    ×
                  </button>
                </div>

                <div class="add-bookmark-inline">
                  <input
                    v-model="bookmarkDrafts[catIndex]!.name"
                    type="text"
                    class="name-input"
                    :placeholder="t('bookmark_name_placeholder')"
                    :data-cat-index="catIndex"
                  />
                  <input
                    v-model="bookmarkDrafts[catIndex]!.url"
                    type="url"
                    class="url-input"
                    :placeholder="t('bookmark_url_placeholder')"
                    :data-cat-index="catIndex"
                    @keypress.enter.prevent="addBookmarkToCategory(catIndex)"
                  />
                  <button type="button" class="add-btn" :data-cat-index="catIndex" :title="t('add_bookmark')" @click="addBookmarkToCategory(catIndex)">
                    +
                  </button>
                </div>
              </div>
            </div>

            <button v-if="canAddCategory" type="button" class="add-category-btn" @click="addCategory">
              <span>+</span> {{ t("add_category") }}
            </button>
          </div>
        </section>

          <section v-show="activeSection === 'data-settings'" id="data-settings" class="settings-section">
            <div class="settings-section-header">
              <h2>{{ t("data_management") }}</h2>
              <button type="submit" class="save-btn">
                <span class="btn-text">{{ t("save_settings") }}</span>
                <span class="btn-icon">✓</span>
              </button>
            </div>
          <div class="setting-item">
            <div class="setting-info">
              <label>{{ t("import_export") }}</label>
              <span class="setting-description">{{ t("import_export_desc") }}</span>
            </div>
            <div class="import-export-btns">
              <button type="button" class="export-btn" id="export-btn" @click="exportSettings">{{ t("export") }}</button>
              <button type="button" class="import-btn" id="import-btn" @click="importFile?.click()">{{ t("import") }}</button>
              <input ref="importFile" type="file" id="import-file" accept=".json" style="display: none" @change="importSettings" />
            </div>
          </div>
        </section>

        <div class="actions">
          <button type="button" class="reset-btn" id="reset-btn" @click="resetSettings">{{ t("reset_defaults") }}</button>
        </div>
        </form>
      </div>
    </div>
  </main>

  <div id="toast-container" class="toast-container">
    <div v-for="toast in toasts" :key="toast.id" class="toast show" :class="toast.type">
      <span class="toast-icon">{{ toastIcon(toast.type) }}</span>
      <span>{{ toast.message }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, reactive, ref, watch } from "vue";
import type { BookmarkCategory, DockSite, Settings, SettingsStorage } from "../../types/settings";
import { getDefaultSettings } from "../../types/settings";
import { clone, defaultBookmarkCategories, defaultDockSites, dockSitePresets } from "../../utils/data";
import { getFaviconUrl, normalizeUrl } from "../../utils/format";
import { createTranslator, type I18nKey } from "../../utils/i18n";
import { appStorage } from "../../utils/storage";
import { applyTheme } from "../../utils/theme";

const isEdgeBuild = import.meta.env.BROWSER === "edge";
const MIN_CATEGORIES = 2;
const MAX_CATEGORIES = 4;
const MAX_DOCK_SITES = 10;
const defaultSettings = getDefaultSettings();

const SettingToggle = defineComponent({
  props: {
    id: { type: String, required: true },
    modelValue: { type: Boolean, required: true },
    label: { type: String, required: true },
    description: { type: String, required: true },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    return () =>
      h("div", { class: "setting-item" }, [
        h("div", { class: "setting-info" }, [
          h("label", { for: props.id }, props.label),
          h("span", { class: "setting-description" }, props.description),
        ]),
        h("label", { class: "toggle" }, [
          h("input", {
            id: props.id,
            type: "checkbox",
            checked: props.modelValue,
            onChange: (event: Event) => emit("update:modelValue", (event.target as HTMLInputElement).checked),
          }),
          h("span", { class: "slider" }),
        ]),
      ]);
  },
});

type Toast = { id: number; message: string; type: "success" | "warning" | "error" };

const settings = reactive<Settings>({ ...defaultSettings });
const bookmarkCategories = ref<BookmarkCategory[]>(clone(defaultBookmarkCategories));
const currentDockSites = ref<DockSite[]>(clone(defaultDockSites));
const importFile = ref<HTMLInputElement | null>(null);
const bookmarkDrafts = reactive<Record<number, { name: string; url: string }>>({});
const toasts = ref<Toast[]>([]);
const dockDragIndex = ref<number | null>(null);
const dockDropIndex = ref<number | null>(null);
const categoryDragIndex = ref<number | null>(null);
const categoryDropIndex = ref<number | null>(null);
const activeSection = ref("display-settings");

const activeTranslator = computed(() => createTranslator(settings.language));
const canDeleteCategory = computed(() => bookmarkCategories.value.length > MIN_CATEGORIES);
const canAddCategory = computed(() => bookmarkCategories.value.length < MAX_CATEGORIES);
const availablePresets = computed(() => {
  const activeUrls = new Set(currentDockSites.value.map((site) => site.url));
  return dockSitePresets.filter((preset) => !activeUrls.has(preset.url));
});

const colorPresets: Array<{ color: string; titleKey: I18nKey }> = [
  { color: "#DDE2EF", titleKey: "color_lavender" },
  { color: "#E8F5E9", titleKey: "color_mint" },
  { color: "#FFF8E1", titleKey: "color_cream" },
  { color: "#FFEBEE", titleKey: "color_cherry" },
  { color: "#E3F2FD", titleKey: "color_sky" },
  { color: "#F3E5F5", titleKey: "color_purple" },
  { color: "#ECEFF1", titleKey: "color_silver" },
  { color: "#FFFFFF", titleKey: "color_white" },
];

function t(key: I18nKey, vars: Record<string, string | number> = {}): string {
  return activeTranslator.value(key, vars);
}

function ensureBookmarkDrafts(): void {
  bookmarkCategories.value.forEach((_, index) => {
    bookmarkDrafts[index] ??= { name: "", url: "" };
  });
}

watch(
  () => [settings.theme, settings.lightBgColor, settings.language] as const,
  () => {
    document.documentElement.lang = settings.language;
    document.title = activeTranslator.value("page_title");
    applyTheme(settings.theme, settings.lightBgColor);
  },
  { immediate: true },
);

watch(bookmarkCategories, ensureBookmarkDrafts, { deep: true, immediate: true });

async function loadSettings(): Promise<void> {
  try {
    const result = (await appStorage.sync.get({
      ...defaultSettings,
      bookmarkCategories: null,
      dockSites: null,
    })) as SettingsStorage;

    Object.assign(settings, { ...defaultSettings, ...result });
    bookmarkCategories.value = Array.isArray(result.bookmarkCategories)
      ? clone(result.bookmarkCategories)
      : clone(defaultBookmarkCategories);
    currentDockSites.value = Array.isArray(result.dockSites) ? clone(result.dockSites) : clone(defaultDockSites);
    ensureBookmarkDrafts();
  } catch (error) {
    console.error("Failed to load settings:", error);
    showToast(activeTranslator.value("save_failed"), "error");
  }
}

function buildSettingsPayload(): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    showDateTime: settings.showDateTime,
    showDock: settings.showDock,
    showBookmarks: settings.showBookmarks,
    theme: settings.theme,
    lightBgColor: settings.lightBgColor,
    searchBorderRadius: settings.searchBorderRadius,
    bookmarksFontWeight: settings.bookmarksFontWeight,
    linkTarget: settings.linkTarget,
    showDockLabels: settings.showDockLabels,
    language: settings.language,
    bookmarkCategories: clone(bookmarkCategories.value),
    dockSites: clone(currentDockSites.value),
  };

  if (isEdgeBuild) {
    payload.searchEngine = settings.searchEngine;
    payload.saveSearchHistory = settings.saveSearchHistory;
    payload.maxSearchHistory = settings.maxSearchHistory;
  }

  return payload;
}

async function saveSettings(): Promise<void> {
  try {
    await appStorage.sync.set(buildSettingsPayload());
    showToast(activeTranslator.value("settings_saved"), "success");
  } catch (error) {
    console.error("Failed to save settings:", error);
    showToast(activeTranslator.value("save_failed"), "error");
  }
}

async function resetSettings(): Promise<void> {
  if (!confirm(activeTranslator.value("reset_settings_confirm"))) return;

  try {
    Object.assign(settings, { ...defaultSettings });
    bookmarkCategories.value = clone(defaultBookmarkCategories);
    currentDockSites.value = clone(defaultDockSites);
    await appStorage.sync.set({
      ...buildSettingsPayload(),
      ...(isEdgeBuild
        ? {
            searchEngine: defaultSettings.searchEngine,
            saveSearchHistory: defaultSettings.saveSearchHistory,
            maxSearchHistory: defaultSettings.maxSearchHistory,
          }
        : {}),
    });
    showToast(activeTranslator.value("settings_reset"), "success");
  } catch (error) {
    console.error("Failed to reset settings:", error);
    showToast(activeTranslator.value("reset_failed"), "error");
  }
}

function addDockSite(site: DockSite): void {
  if (currentDockSites.value.length >= MAX_DOCK_SITES) {
    showToast(activeTranslator.value("dock_limit_reached", { max: MAX_DOCK_SITES }), "warning");
    return;
  }
  if (currentDockSites.value.some((activeSite) => activeSite.url === site.url)) {
    showToast(`${site.name} ${activeTranslator.value("dock_site_exists")}`, "warning");
    return;
  }
  currentDockSites.value.push(clone(site));
  if (currentDockSites.value.length === 1 && !settings.showDock) {
    settings.showDock = true;
    showToast(activeTranslator.value("dock_auto_enabled"), "success");
  }
}

function removeDockSite(index: number): void {
  currentDockSites.value.splice(index, 1);
  if (currentDockSites.value.length === 0) {
    settings.showDock = false;
    showToast(activeTranslator.value("dock_empty_hidden"), "warning");
  }
}

function startDockManagerDrag(index: number): void {
  dockDragIndex.value = index;
}

function dropDockManager(index: number): void {
  const fromIndex = dockDragIndex.value;
  if (fromIndex == null || fromIndex === index) return;
  const [moved] = currentDockSites.value.splice(fromIndex, 1);
  if (moved) currentDockSites.value.splice(index, 0, moved);
  endDockManagerDrag();
}

function endDockManagerDrag(): void {
  dockDragIndex.value = null;
  dockDropIndex.value = null;
}

function startCategoryDrag(index: number): void {
  categoryDragIndex.value = index;
}

function dropCategory(index: number): void {
  const fromIndex = categoryDragIndex.value;
  if (fromIndex == null || fromIndex === index) return;
  const [moved] = bookmarkCategories.value.splice(fromIndex, 1);
  if (moved) bookmarkCategories.value.splice(index, 0, moved);
  endCategoryDrag();
}

function endCategoryDrag(): void {
  categoryDragIndex.value = null;
  categoryDropIndex.value = null;
}

function addBookmarkToCategory(catIndex: number): void {
  const category = bookmarkCategories.value[catIndex];
  const draft = bookmarkDrafts[catIndex];
  if (!category || !draft) return;

  const name = draft.name.trim();
  const url = normalizeUrl(draft.url);
  if (!name) {
    showToast(activeTranslator.value("enter_bookmark_name"), "warning");
    return;
  }
  if (!draft.url.trim()) {
    showToast(activeTranslator.value("enter_bookmark_url"), "warning");
    return;
  }
  if (!url) {
    showToast(activeTranslator.value("enter_valid_url"), "warning");
    return;
  }

  const existingCategory = bookmarkCategories.value.find((item) =>
    item.bookmarks.some((bookmark) => bookmark.url === url),
  );
  if (existingCategory) {
    showToast(activeTranslator.value("bookmark_exists_in_category", { category: existingCategory.name }), "warning");
    return;
  }

  category.bookmarks.push({ name, url });
  bookmarkDrafts[catIndex] = { name: "", url: "" };
}

function deleteBookmark(catIndex: number, bookmarkIndex: number): void {
  bookmarkCategories.value[catIndex]?.bookmarks.splice(bookmarkIndex, 1);
}

function addCategory(): void {
  if (!canAddCategory.value) {
    showToast(activeTranslator.value("category_limit_max"), "warning");
    return;
  }
  bookmarkCategories.value.push({ name: activeTranslator.value("new_category"), bookmarks: [] });
}

function deleteCategory(catIndex: number): void {
  if (!canDeleteCategory.value) {
    showToast(activeTranslator.value("category_limit_min"), "warning");
    return;
  }
  if (!confirm(activeTranslator.value("delete_category_confirm"))) return;
  bookmarkCategories.value.splice(catIndex, 1);
}

function exportSettings(): void {
  const blob = new Blob([JSON.stringify(buildSettingsPayload(), null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `traiex-settings-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast(activeTranslator.value("export_success"), "success");
}

async function importSettings(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  try {
    const imported = JSON.parse(await file.text()) as Partial<SettingsStorage>;
    Object.assign(settings, { ...settings, ...imported });
    if (Array.isArray(imported.bookmarkCategories)) bookmarkCategories.value = clone(imported.bookmarkCategories);
    if (Array.isArray(imported.dockSites)) currentDockSites.value = clone(imported.dockSites);
    ensureBookmarkDrafts();
    showToast(activeTranslator.value("import_pending_apply"), "success");
  } catch (error) {
    console.error("Import failed:", error);
    showToast(activeTranslator.value("import_error"), "error");
  } finally {
    input.value = "";
  }
}

async function clearHistory(): Promise<void> {
  if (!confirm(activeTranslator.value("clear_search_history_confirm"))) return;
  try {
    const { clearSearchHistory } = await import("../../utils/edge-search");
    await clearSearchHistory();
    showToast(activeTranslator.value("search_history_cleared"), "success");
  } catch (error) {
    console.error("Failed to clear search history:", error);
    showToast(activeTranslator.value("clear_failed"), "error");
  }
}

function showToast(message: string, type: Toast["type"] = "success", duration = 3000): void {
  const id = Date.now() + Math.random();
  toasts.value.push({ id, message, type });
  window.setTimeout(() => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id);
  }, duration);
}

function toastIcon(type: Toast["type"]): string {
  if (type === "error") return "✕";
  if (type === "warning") return "!";
  return "✓";
}

function hideBrokenImage(event: Event): void {
  (event.currentTarget as HTMLImageElement).style.display = "none";
}

onMounted(() => {
  void loadSettings();
});
</script>
