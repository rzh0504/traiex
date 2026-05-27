type StorageChanges = Record<string, { oldValue?: unknown; newValue?: unknown }>;
type StorageAreaName = "sync" | "local";
type StorageListener = (changes: StorageChanges, namespace: StorageAreaName) => void;

type StorageArea = {
  get(keys?: unknown): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
  remove(keys: string | string[]): Promise<void>;
  clear(): Promise<void>;
};

type AppStorage = {
  sync: StorageArea;
  local: StorageArea;
  onChanged: {
    addListener(listener: StorageListener): void;
    removeListener(listener: StorageListener): void;
  };
};

const storagePrefixes: Record<StorageAreaName, string> = {
  sync: "traiex:storage:sync",
  local: "traiex:storage:local",
};

const extensionStorage = (globalThis as { chrome?: { storage?: AppStorage }; browser?: { storage?: AppStorage } })
  .chrome?.storage ?? (globalThis as { browser?: { storage?: AppStorage } }).browser?.storage;

const localStorageChangeListeners = new Set<StorageListener>();

function cloneStorageValue<T>(value: T): T {
  if (value === undefined) return value;
  return typeof structuredClone === "function"
    ? structuredClone(value)
    : (JSON.parse(JSON.stringify(value)) as T);
}

function getStorageBucket(area: StorageAreaName): Record<string, unknown> {
  try {
    const raw = localStorage.getItem(storagePrefixes[area]);
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
  } catch (error) {
    console.error(`Failed to read ${area} storage:`, error);
    return {};
  }
}

function setStorageBucket(area: StorageAreaName, value: Record<string, unknown>): void {
  localStorage.setItem(storagePrefixes[area], JSON.stringify(value));
}

function buildStorageResult(area: StorageAreaName, keys?: unknown): Record<string, unknown> {
  const bucket = getStorageBucket(area);

  if (keys == null) return cloneStorageValue(bucket);
  if (typeof keys === "string") return { [keys]: cloneStorageValue(bucket[keys]) };
  if (Array.isArray(keys)) {
    return keys.reduce<Record<string, unknown>>((result, key) => {
      if (typeof key === "string") result[key] = cloneStorageValue(bucket[key]);
      return result;
    }, {});
  }
  if (typeof keys === "object") {
    return Object.entries(keys as Record<string, unknown>).reduce<Record<string, unknown>>(
      (result, [key, defaultValue]) => {
        result[key] = key in bucket ? cloneStorageValue(bucket[key]) : cloneStorageValue(defaultValue);
        return result;
      },
      {},
    );
  }

  return {};
}

function diffStorageBuckets(previousBucket: Record<string, unknown>, nextBucket: Record<string, unknown>): StorageChanges {
  const changes: StorageChanges = {};
  const keys = new Set([...Object.keys(previousBucket), ...Object.keys(nextBucket)]);

  keys.forEach((key) => {
    const oldValue = previousBucket[key];
    const newValue = nextBucket[key];
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes[key] = {
        oldValue: cloneStorageValue(oldValue),
        newValue: cloneStorageValue(newValue),
      };
    }
  });

  return changes;
}

function notifyLocalStorageListeners(changes: StorageChanges, area: StorageAreaName): void {
  if (Object.keys(changes).length === 0) return;
  localStorageChangeListeners.forEach((listener) => {
    try {
      listener(changes, area);
    } catch (error) {
      console.error("Storage listener failed:", error);
    }
  });
}

function createLocalStorageArea(area: StorageAreaName): StorageArea {
  return {
    async get(keys?: unknown) {
      return buildStorageResult(area, keys);
    },
    async set(items) {
      const previousBucket = getStorageBucket(area);
      const nextBucket = { ...previousBucket, ...cloneStorageValue(items) };
      setStorageBucket(area, nextBucket);
      notifyLocalStorageListeners(diffStorageBuckets(previousBucket, nextBucket), area);
    },
    async remove(keys) {
      const previousBucket = getStorageBucket(area);
      const nextBucket = { ...previousBucket };
      const keysToRemove = Array.isArray(keys) ? keys : [keys];
      keysToRemove.forEach((key) => delete nextBucket[key]);
      setStorageBucket(area, nextBucket);
      notifyLocalStorageListeners(diffStorageBuckets(previousBucket, nextBucket), area);
    },
    async clear() {
      const previousBucket = getStorageBucket(area);
      localStorage.removeItem(storagePrefixes[area]);
      notifyLocalStorageListeners(diffStorageBuckets(previousBucket, {}), area);
    },
  };
}

export const appStorage: AppStorage = extensionStorage
  ? {
      sync: extensionStorage.sync,
      local: extensionStorage.local,
      onChanged: extensionStorage.onChanged,
    }
  : {
      sync: createLocalStorageArea("sync"),
      local: createLocalStorageArea("local"),
      onChanged: {
        addListener(listener) {
          localStorageChangeListeners.add(listener);
        },
        removeListener(listener) {
          localStorageChangeListeners.delete(listener);
        },
      },
    };

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    const area = Object.entries(storagePrefixes).find(([, key]) => key === event.key)?.[0] as
      | StorageAreaName
      | undefined;
    if (!area) return;

    const previousBucket = event.oldValue ? (JSON.parse(event.oldValue) as Record<string, unknown>) : {};
    const nextBucket = event.newValue ? (JSON.parse(event.newValue) as Record<string, unknown>) : {};
    notifyLocalStorageListeners(diffStorageBuckets(previousBucket, nextBucket), area);
  });
}
