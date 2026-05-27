<template>
  <main>
    <section id="traichu">
      <h1 class="sr-only">traiex</h1>

      <section id="date-time" v-show="settings.showDateTime">
        <h2 class="sr-only">Date &amp; Time</h2>
        <p id="time">{{ timeText }}</p>
        <p id="date">{{ dateText }}</p>
      </section>

      <nav
        id="dock"
        v-show="settings.showDock"
        :class="{ 'dock-edit-mode': dockEditMode }"
        @pointerleave="cancelDockLongPress"
      >
        <ul :class="{ 'with-labels': settings.showDockLabels }">
          <li
            v-for="(site, index) in dockSites"
            :key="site.url"
            :data-index="index"
            :draggable="dockEditMode"
            :class="{
              dragging: dockDragIndex === index,
              'drag-over-left': dockDropIndex === index && dockDropSide === 'left',
              'drag-over-right': dockDropIndex === index && dockDropSide === 'right',
            }"
            @pointerdown="startDockLongPress($event, index)"
            @pointermove="moveDockLongPress($event)"
            @pointerup="cancelDockLongPress"
            @pointercancel="cancelDockLongPress"
            @dragstart="startDockDrag($event, index)"
            @dragover.prevent="overDockDrag($event, index)"
            @drop.prevent="dropDock($event, index)"
            @dragend="endDockDrag"
          >
            <a
              :href="site.url"
              :target="settings.linkTarget"
              :rel="settings.linkTarget === '_blank' ? 'noopener noreferrer' : undefined"
              :aria-label="site.name"
              :title="site.name"
              @click="handleDockClick($event, site.url)"
            >
              <img v-if="site.icon" :src="site.icon" :alt="site.name" class="dock-icon" />
              <span v-if="settings.showDockLabels" class="dock-label">{{ site.name }}</span>
            </a>
          </li>
        </ul>
      </nav>

      <section id="search">
        <h2 class="sr-only">Search</h2>
        <form role="search" @submit.prevent="submitSearch">
          <input
            id="q"
            ref="searchInput"
            v-model="query"
            type="text"
            autofocus
            autocomplete="off"
            :name="edgeSearchParam"
            :data-engine="isEdgeBuild ? settings.searchEngine : undefined"
            :style="{ borderRadius: `${settings.searchBorderRadius}px` }"
            @click="showSearchDropdown"
            @input="handleSearchInput"
            @keydown="handleSearchKeydown"
            @blur="hideSuggestions"
          />
          <button id="search-btn" type="submit" aria-label="Search"></button>
        </form>

        <ul
          v-if="isEdgeBuild"
          id="search-history-dropdown"
          class="search-history-dropdown"
          :style="{ display: suggestionsVisible && suggestions.length > 0 ? 'block' : 'none' }"
          :data-selected-index="selectedSuggestionIndex"
        >
          <li
            v-for="(suggestion, index) in suggestions"
            :key="`${suggestion.type}-${suggestion.text}-${index}`"
            :class="[
              suggestion.type === 'bookmark' ? 'search-bookmark-item' : 'search-history-item',
              { selected: selectedSuggestionIndex === index },
            ]"
            :data-type="suggestion.type"
            :data-url="suggestion.url ?? ''"
            @mousedown.prevent="chooseSuggestion(suggestion)"
          >
            <span v-if="suggestion.type === 'bookmark'" class="suggestion-icon">🔖</span>
            <span v-else-if="query.trim()" class="suggestion-icon">🕐</span>
            <span class="suggestion-text" v-html="highlightSuggestion(suggestion)"></span>
          </li>
        </ul>
      </section>

      <section
        id="bookmarks"
        v-show="settings.showBookmarks"
        :class="[
          `bookmark-layout-${settings.bookmarkLayout}`,
          { 'bookmark-edit-mode': bookmarkEditMode },
        ]"
        :style="{ marginTop: settings.showDock ? '' : '2rem' }"
      >
        <h2 class="sr-only">Bookmarks</h2>
        <div v-if="!hasBookmarks" class="bookmarks-empty-state">
          <div class="bookmarks-empty-icon" aria-hidden="true">⌘</div>
          <p class="bookmarks-empty-title">{{ emptyBookmarksTitle }}</p>
          <p class="bookmarks-empty-description">{{ emptyBookmarksDescription }}</p>
          <div class="bookmarks-empty-actions">
            <a href="/options.html#bookmark-settings" class="bookmarks-empty-action">{{ emptyBookmarksAction }}</a>
            <button
              type="button"
              class="bookmarks-empty-icon-action"
              :title="hideBookmarksTitle"
              :aria-label="hideBookmarksTitle"
              @click="hideBookmarksSection"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                <path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                <line x1="2" y1="2" x2="22" y2="22"></line>
              </svg>
            </button>
          </div>
        </div>
        <ul
          v-for="(category, catIndex) in bookmarkCategories"
          v-else
          :key="category.name"
          :data-cat-index="catIndex"
          :class="{ 'bm-drag-over-ul': bookmarkCategoryDropIndex === catIndex }"
          @dragover.prevent="overBookmarkCategoryDrag($event, catIndex)"
          @dragleave="leaveBookmarkCategoryDrag($event, catIndex)"
          @drop.prevent="dropBookmarkToCategory($event, catIndex)"
        >
          <li v-if="category.name" class="category-header-item">{{ category.name }}</li>
          <li
            v-for="(bookmark, bmIndex) in category.bookmarks"
            :key="bookmark.url"
            :data-cat-index="catIndex"
            :data-bm-index="bmIndex"
            :draggable="bookmarkEditMode"
            :class="{
              'bm-dragging': bookmarkDrag?.catIndex === catIndex && bookmarkDrag.bmIndex === bmIndex,
              'bm-drag-over-top':
                bookmarkDrop?.catIndex === catIndex && bookmarkDrop.bmIndex === bmIndex && bookmarkDrop.side === 'top',
              'bm-drag-over-bottom':
                bookmarkDrop?.catIndex === catIndex && bookmarkDrop.bmIndex === bmIndex && bookmarkDrop.side === 'bottom',
              'bm-drag-over-left':
                bookmarkDrop?.catIndex === catIndex && bookmarkDrop.bmIndex === bmIndex && bookmarkDrop.side === 'left',
              'bm-drag-over-right':
                bookmarkDrop?.catIndex === catIndex && bookmarkDrop.bmIndex === bmIndex && bookmarkDrop.side === 'right',
            }"
            @pointerdown="startBookmarkLongPress($event, catIndex, bmIndex)"
            @pointermove="moveBookmarkLongPress($event)"
            @pointerup="cancelBookmarkLongPress"
            @pointercancel="cancelBookmarkLongPress"
            @dragstart="startBookmarkDrag($event, catIndex, bmIndex)"
            @dragover.prevent="overBookmarkDrag($event, catIndex, bmIndex)"
            @drop.prevent="dropBookmark(catIndex, bmIndex)"
            @dragend="endBookmarkDrag"
          >
            <a
              :href="bookmark.url"
              :target="settings.linkTarget"
              :rel="settings.linkTarget === '_blank' ? 'noopener noreferrer' : undefined"
              @click="handleBookmarkClick($event, bookmark.url)"
            >
              <img
                :src="getFaviconUrl(bookmark.url)"
                class="favicon"
                :alt="`${bookmark.name} favicon`"
                loading="lazy"
                decoding="async"
                @error="handleFaviconError($event, bookmark.url)"
              />
              {{ bookmark.name }}
            </a>
          </li>
          <li
            v-if="bookmarkEditMode && category.bookmarks.length === 0"
            class="bookmark-empty-drop-zone"
            :class="{ 'bm-drag-over-empty': bookmarkCategoryDropIndex === catIndex }"
            @dragover.prevent="overBookmarkCategoryDrag($event, catIndex)"
            @drop.prevent="dropBookmarkToCategory($event, catIndex)"
          >
            {{ emptyCategoryDropText }}
          </li>
        </ul>
      </section>
    </section>
  </main>

  <a href="/options.html" id="settings-btn" class="settings-btn" title="设置" aria-label="打开设置">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z">
      </path>
    </svg>
  </a>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import type { BookmarkCategory, DockSite, Settings, SettingsStorage } from "../../types/settings";
import { getDefaultSettings } from "../../types/settings";
import { clone, defaultBookmarkCategories, defaultDockSites, removeLegacyPresetBookmarks } from "../../utils/data";
import { escapeHtml, getDuckDuckGoFaviconUrl, getFaviconUrl } from "../../utils/format";
import type { SearchSuggestion } from "../../utils/edge-search";
import { queryChromeDefaultSearch } from "../../utils/chrome-search";
import { appStorage } from "../../utils/storage";
import { applyTheme } from "../../utils/theme";

const LONG_PRESS_DURATION = 500;
const isEdgeBuild = import.meta.env.BROWSER === "edge";
const defaultSettings = getDefaultSettings();

const settings = reactive<Settings>({ ...defaultSettings });
const dockSites = ref<DockSite[]>(clone(defaultDockSites));
const bookmarkCategories = ref<BookmarkCategory[]>(clone(defaultBookmarkCategories));
const searchInput = ref<HTMLInputElement | null>(null);
const query = ref("");
const suggestions = ref<SearchSuggestion[]>([]);
const suggestionsVisible = ref(false);
const selectedSuggestionIndex = ref(-1);

const timeText = ref("");
const dateText = ref("");
let dateTimeTimerId: number | undefined;
let dateLocale = "";
let timeFormatter: Intl.DateTimeFormat | null = null;
let dateFormatter: Intl.DateTimeFormat | null = null;

const dockEditMode = ref(false);
const dockDragIndex = ref<number | null>(null);
const dockDropIndex = ref<number | null>(null);
const dockDropSide = ref<"left" | "right" | null>(null);
let dockLongPressTimer: number | undefined;
let dockPointerStart: { x: number; y: number } | null = null;
let suppressDockClick = false;

const bookmarkEditMode = ref(false);
const bookmarkDrag = ref<{ catIndex: number; bmIndex: number } | null>(null);
const bookmarkDrop = ref<{ catIndex: number; bmIndex: number; side: "top" | "bottom" | "left" | "right" } | null>(null);
const bookmarkCategoryDropIndex = ref<number | null>(null);
let bookmarkLongPressTimer: number | undefined;
let bookmarkPointerStart: { x: number; y: number } | null = null;
let suppressBookmarkClick = false;
let isNavigatingAway = false;

const edgeSearchParam = computed(() => {
  if (!isEdgeBuild) return undefined;
  return ({ google: "q", bing: "q", duckduckgo: "q", baidu: "wd" } as const)[settings.searchEngine ?? "google"];
});

const hasBookmarks = computed(() => bookmarkCategories.value.some((category) => category.bookmarks.length > 0));
const emptyCategoryDropText = computed(() => (settings.language === "en" ? "Drop bookmark here" : "拖到这里"));
const emptyBookmarksTitle = computed(() => (settings.language === "en" ? "No bookmarks yet" : "还没有书签"));
const emptyBookmarksDescription = computed(() =>
  settings.language === "en" ? "Add your favorite links in settings." : "在设置中添加常用链接，它们会显示在这里。",
);
const emptyBookmarksAction = computed(() => (settings.language === "en" ? "Manage bookmarks" : "管理书签"));
const hideBookmarksTitle = computed(() => (settings.language === "en" ? "Hide bookmarks bar" : "隐藏书签栏"));

watch(
  () => [settings.theme, settings.lightBgColor, settings.bookmarksFontWeight, settings.language] as const,
  () => {
    document.documentElement.lang = settings.language;
    document.documentElement.style.setProperty("--bookmarks-font-weight", String(settings.bookmarksFontWeight));
    applyTheme(settings.theme, settings.lightBgColor);
    renderDateTime(true);
  },
  { immediate: true },
);

async function hideBookmarksSection(): Promise<void> {
  settings.showBookmarks = false;
  await appStorage.sync.set({ showBookmarks: false });
}

function updateDateTimeFormatters(locale: string): void {
  if (dateLocale === locale && timeFormatter && dateFormatter) return;
  dateLocale = locale;
  timeFormatter = new Intl.DateTimeFormat(locale, { hour12: false, hour: "2-digit", minute: "2-digit" });
  dateFormatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

function renderDateTime(force = false): void {
  if (!settings.showDateTime && !force) return;
  const date = new Date();
  updateDateTimeFormatters(settings.language);
  timeText.value = timeFormatter?.format(date) ?? "";
  dateText.value = dateFormatter?.format(date) ?? "";
}

function scheduleDateTimeTick(): void {
  window.clearTimeout(dateTimeTimerId);
  const now = new Date();
  const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds() + 50;
  dateTimeTimerId = window.setTimeout(() => {
    renderDateTime();
    scheduleDateTimeTick();
  }, msUntilNextMinute);
}

function stopDateTime(): void {
  window.clearTimeout(dateTimeTimerId);
  dateTimeTimerId = undefined;
}

watch(
  () => settings.showDateTime,
  (visible) => {
    if (visible) {
      renderDateTime(true);
      scheduleDateTimeTick();
    } else {
      stopDateTime();
    }
  },
);

async function loadSettings(): Promise<void> {
  try {
    const result = (await appStorage.sync.get({
      ...defaultSettings,
      bookmarkCategories: null,
      dockSites: null,
    })) as SettingsStorage;

    Object.assign(settings, { ...defaultSettings, ...result });
    dockSites.value = Array.isArray(result.dockSites) ? clone(result.dockSites) : clone(defaultDockSites);
    bookmarkCategories.value = Array.isArray(result.bookmarkCategories)
      ? removeLegacyPresetBookmarks(clone(result.bookmarkCategories))
      : clone(defaultBookmarkCategories);
  } catch (error) {
    console.error("Failed to load settings:", error);
  }
}

function shouldHandleSameTabNavigation(event: MouseEvent): boolean {
  return (
    settings.linkTarget === "_self" &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

function preparePageForNavigation(): void {
  if (isNavigatingAway) return;
  isNavigatingAway = true;
  const style = getComputedStyle(document.documentElement);
  const backgroundColor = style.getPropertyValue("--primary-background-color").trim() || getComputedStyle(document.body).backgroundColor;
  document.documentElement.style.backgroundColor = backgroundColor;
  document.body.style.backgroundColor = backgroundColor;
  document.body.style.opacity = "1";
  document.body.classList.remove("loaded");
  document.body.classList.add("navigating");
}

function navigateCurrentTab(url: string): void {
  preparePageForNavigation();
  requestAnimationFrame(() => window.location.assign(url));
}

function handleDockClick(event: MouseEvent, url: string): void {
  if (suppressDockClick || dockEditMode.value) {
    suppressDockClick = false;
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  if (shouldHandleSameTabNavigation(event)) {
    event.preventDefault();
    navigateCurrentTab(url);
  }
  (event.currentTarget as HTMLElement).blur();
}

function handleBookmarkClick(event: MouseEvent, url: string): void {
  if (suppressBookmarkClick || bookmarkEditMode.value) {
    suppressBookmarkClick = false;
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  if (shouldHandleSameTabNavigation(event)) {
    event.preventDefault();
    navigateCurrentTab(url);
  }
  (event.currentTarget as HTMLElement).blur();
}

function startDockLongPress(event: PointerEvent, index: number): void {
  if (event.pointerType === "mouse" && event.button !== 0) return;
  cancelDockLongPress();
  dockPointerStart = { x: event.clientX, y: event.clientY };
  dockLongPressTimer = window.setTimeout(() => {
    dockEditMode.value = true;
    suppressDockClick = true;
  }, LONG_PRESS_DURATION);
}

function moveDockLongPress(event: PointerEvent): void {
  if (!dockLongPressTimer || !dockPointerStart) return;
  if (Math.abs(event.clientX - dockPointerStart.x) > 8 || Math.abs(event.clientY - dockPointerStart.y) > 8) {
    cancelDockLongPress();
  }
}

function cancelDockLongPress(): void {
  window.clearTimeout(dockLongPressTimer);
  dockLongPressTimer = undefined;
  dockPointerStart = null;
}

function startDockDrag(event: DragEvent, index: number): void {
  if (!dockEditMode.value) {
    event.preventDefault();
    return;
  }
  dockDragIndex.value = index;
  event.dataTransfer?.setData("text/plain", String(index));
  if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
}

function overDockDrag(event: DragEvent, index: number): void {
  if (dockDragIndex.value == null || dockDragIndex.value === index) {
    dockDropIndex.value = null;
    return;
  }
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  dockDropIndex.value = index;
  dockDropSide.value = event.clientX < rect.left + rect.width / 2 ? "left" : "right";
}

async function dropDock(event: DragEvent, index: number): Promise<void> {
  const fromIndex = dockDragIndex.value;
  if (fromIndex == null || fromIndex === index) return;
  const nextSites = [...dockSites.value];
  const moved = nextSites.splice(fromIndex, 1)[0];
  if (!moved) return;
  const side = dockDropSide.value ?? "left";
  const targetIndex = fromIndex < index ? index - 1 : index;
  nextSites.splice(side === "right" ? targetIndex + 1 : targetIndex, 0, moved);
  dockSites.value = nextSites;
  settings.dockSites = nextSites;
  await appStorage.sync.set({ dockSites: nextSites });
  endDockDrag();
  event.preventDefault();
}

function endDockDrag(): void {
  dockDragIndex.value = null;
  dockDropIndex.value = null;
  dockDropSide.value = null;
}

function startBookmarkLongPress(event: PointerEvent, catIndex: number, bmIndex: number): void {
  if (event.pointerType === "mouse" && event.button !== 0) return;
  cancelBookmarkLongPress();
  bookmarkPointerStart = { x: event.clientX, y: event.clientY };
  bookmarkLongPressTimer = window.setTimeout(() => {
    bookmarkEditMode.value = true;
    suppressBookmarkClick = true;
  }, LONG_PRESS_DURATION);
}

function moveBookmarkLongPress(event: PointerEvent): void {
  if (!bookmarkLongPressTimer || !bookmarkPointerStart) return;
  if (Math.abs(event.clientX - bookmarkPointerStart.x) > 10 || Math.abs(event.clientY - bookmarkPointerStart.y) > 10) {
    cancelBookmarkLongPress();
  }
}

function cancelBookmarkLongPress(): void {
  window.clearTimeout(bookmarkLongPressTimer);
  bookmarkLongPressTimer = undefined;
  bookmarkPointerStart = null;
}

function startBookmarkDrag(event: DragEvent, catIndex: number, bmIndex: number): void {
  if (!bookmarkEditMode.value) {
    event.preventDefault();
    return;
  }
  bookmarkDrag.value = { catIndex, bmIndex };
  event.dataTransfer?.setData("text/plain", `${catIndex}:${bmIndex}`);
  if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
}

function overBookmarkDrag(event: DragEvent, catIndex: number, bmIndex: number): void {
  if (!bookmarkDrag.value) return;
  bookmarkCategoryDropIndex.value = null;
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  bookmarkDrop.value = {
    catIndex,
    bmIndex,
    side:
      settings.bookmarkLayout === "row" && window.matchMedia("(min-width: 48em)").matches
        ? event.clientX < rect.left + rect.width / 2
          ? "left"
          : "right"
        : event.clientY < rect.top + rect.height / 2
          ? "top"
          : "bottom",
  };
}

function overBookmarkCategoryDrag(event: DragEvent, catIndex: number): void {
  if (!bookmarkDrag.value) return;

  const target = event.target as HTMLElement | null;
  if (target?.closest("[data-bm-index]")) return;

  bookmarkDrop.value = null;
  bookmarkCategoryDropIndex.value = catIndex;
}

function leaveBookmarkCategoryDrag(event: DragEvent, catIndex: number): void {
  const currentTarget = event.currentTarget as HTMLElement;
  const relatedTarget = event.relatedTarget as Node | null;
  if (relatedTarget && currentTarget.contains(relatedTarget)) return;
  if (bookmarkCategoryDropIndex.value === catIndex) bookmarkCategoryDropIndex.value = null;
}

async function dropBookmarkToCategory(event: DragEvent, catIndex: number): Promise<void> {
  const drag = bookmarkDrag.value;
  if (!drag) return;

  const target = event.target as HTMLElement | null;
  if (target?.closest("[data-bm-index]")) return;

  const nextCategories = clone(bookmarkCategories.value);
  const sourceCategory = nextCategories[drag.catIndex];
  const targetCategory = nextCategories[catIndex];
  if (!sourceCategory || !targetCategory) return;

  const moved = sourceCategory.bookmarks.splice(drag.bmIndex, 1)[0];
  if (!moved) return;

  targetCategory.bookmarks.push(moved);
  bookmarkCategories.value = nextCategories;
  settings.bookmarkCategories = nextCategories;
  await appStorage.sync.set({ bookmarkCategories: nextCategories });
  endBookmarkDrag();
}

async function dropBookmark(catIndex: number, bmIndex: number): Promise<void> {
  const drag = bookmarkDrag.value;
  if (!drag) return;
  const nextCategories = clone(bookmarkCategories.value);
  const sourceCategory = nextCategories[drag.catIndex];
  const targetCategory = nextCategories[catIndex];
  if (!sourceCategory || !targetCategory) return;
  const moved = sourceCategory.bookmarks.splice(drag.bmIndex, 1)[0];
  if (!moved) return;
  const sameCategory = drag.catIndex === catIndex;
  const adjustedIndex = sameCategory && drag.bmIndex < bmIndex ? bmIndex - 1 : bmIndex;
  const shouldInsertAfter = bookmarkDrop.value?.side === "bottom" || bookmarkDrop.value?.side === "right";
  const insertIndex = shouldInsertAfter ? adjustedIndex + 1 : adjustedIndex;
  targetCategory.bookmarks.splice(insertIndex, 0, moved);
  bookmarkCategories.value = nextCategories;
  settings.bookmarkCategories = nextCategories;
  await appStorage.sync.set({ bookmarkCategories: nextCategories });
  endBookmarkDrag();
}

function endBookmarkDrag(): void {
  bookmarkDrag.value = null;
  bookmarkDrop.value = null;
  bookmarkCategoryDropIndex.value = null;
}

async function submitSearch(): Promise<void> {
  const trimmedQuery = query.value.trim();
  if (!trimmedQuery) return;

  if (isEdgeBuild) {
    const { buildSearchUrl, navigateToUrl, saveSearchToHistory } = await import("../../utils/edge-search");
    await saveSearchToHistory(trimmedQuery, settings);
    navigateToUrl(buildSearchUrl(settings.searchEngine, trimmedQuery), settings.linkTarget);
  } else {
    await queryChromeDefaultSearch(trimmedQuery);
  }

  query.value = "";
  suggestions.value = [];
  searchInput.value?.blur();
}

async function showSearchDropdown(): Promise<void> {
  if (!isEdgeBuild) return;
  suggestionsVisible.value = true;
  if (query.value.trim()) {
    const { getLocalSearchMatches } = await import("../../utils/edge-search");
    suggestions.value = await getLocalSearchMatches(query.value.trim(), settings, bookmarkCategories.value);
  } else if (settings.saveSearchHistory) {
    const { getSearchHistory } = await import("../../utils/edge-search");
    const history = await getSearchHistory();
    suggestions.value = history.map((text) => ({
      type: "history",
      text,
      matchIndex: -1,
      matchLength: 0,
    }));
  }
}

function handleSearchInput(): void {
  if (!isEdgeBuild) return;
  selectedSuggestionIndex.value = -1;
  window.setTimeout(() => void showSearchDropdown(), 120);
}

function handleSearchKeydown(event: KeyboardEvent): void {
  if (!isEdgeBuild || !suggestionsVisible.value || suggestions.value.length === 0) return;

  if (event.key === "ArrowDown") {
    event.preventDefault();
    selectedSuggestionIndex.value = Math.min(selectedSuggestionIndex.value + 1, suggestions.value.length - 1);
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    selectedSuggestionIndex.value = Math.max(selectedSuggestionIndex.value - 1, -1);
  } else if (event.key === "Enter" && selectedSuggestionIndex.value >= 0) {
    event.preventDefault();
    const selected = suggestions.value[selectedSuggestionIndex.value];
    if (selected) void chooseSuggestion(selected);
  }
}

async function chooseSuggestion(suggestion: SearchSuggestion): Promise<void> {
  if (!isEdgeBuild) return;
  const { buildSearchUrl, navigateToUrl, saveSearchToHistory } = await import("../../utils/edge-search");
  if (suggestion.type === "bookmark" && suggestion.url) {
    navigateToUrl(suggestion.url, settings.linkTarget);
  } else {
    await saveSearchToHistory(suggestion.text, settings);
    navigateToUrl(buildSearchUrl(settings.searchEngine, suggestion.text), settings.linkTarget);
  }
  hideSuggestions();
}

function hideSuggestions(): void {
  window.setTimeout(() => {
    suggestionsVisible.value = false;
    selectedSuggestionIndex.value = -1;
  }, 80);
}

function highlightSuggestion(suggestion: SearchSuggestion): string {
  if (suggestion.matchIndex < 0 || suggestion.matchLength === 0) return escapeHtml(suggestion.text);
  const before = escapeHtml(suggestion.text.slice(0, suggestion.matchIndex));
  const match = escapeHtml(suggestion.text.slice(suggestion.matchIndex, suggestion.matchIndex + suggestion.matchLength));
  const after = escapeHtml(suggestion.text.slice(suggestion.matchIndex + suggestion.matchLength));
  return `${before}<mark class="search-match">${match}</mark>${after}`;
}

function handleFaviconError(event: Event, url: string): void {
  const image = event.currentTarget as HTMLImageElement;
  const fallbackUrl = getDuckDuckGoFaviconUrl(url);
  if (fallbackUrl && image.dataset.faviconFallback !== "duckduckgo") {
    image.dataset.faviconFallback = "duckduckgo";
    image.src = fallbackUrl;
    return;
  }
  image.style.display = "none";
}

function handleGlobalClick(event: MouseEvent): void {
  const target = event.target as HTMLElement;
  if (dockEditMode.value && !target.closest("#dock")) dockEditMode.value = false;
  if (bookmarkEditMode.value && !target.closest("#bookmarks")) bookmarkEditMode.value = false;
}

function handleGlobalKeydown(event: KeyboardEvent): void {
  if (event.isComposing) return;

  if (event.key === "Escape") {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    dockEditMode.value = false;
    bookmarkEditMode.value = false;
  }

  if (event.key === "/" && !["INPUT", "TEXTAREA"].includes((document.activeElement as HTMLElement | null)?.tagName ?? "")) {
    event.preventDefault();
    searchInput.value?.focus();
    searchInput.value?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }
}

const storageListener = () => {
  void loadSettings().then(() => nextTick(() => renderDateTime(true)));
};

onMounted(async () => {
  await loadSettings();
  renderDateTime(true);
  if (settings.showDateTime) scheduleDateTimeTick();
  requestAnimationFrame(() => document.body.classList.add("loaded"));
  document.addEventListener("click", handleGlobalClick);
  document.addEventListener("keydown", handleGlobalKeydown);
  window.addEventListener("pageshow", () => {
    query.value = "";
    searchInput.value?.blur();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && !query.value.trim()) searchInput.value?.blur();
  });
  appStorage.onChanged.addListener(storageListener);
});

onUnmounted(() => {
  stopDateTime();
  document.removeEventListener("click", handleGlobalClick);
  document.removeEventListener("keydown", handleGlobalKeydown);
  appStorage.onChanged.removeListener(storageListener);
});
</script>
