type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const getPreferredStorage = (): StorageLike | null => {
  if (typeof window === "undefined") return null;

  const candidates: Array<StorageLike | undefined> = [
    window.localStorage,
    window.sessionStorage,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      const testKey = "__manake_storage_test__";
      candidate.setItem(testKey, "1");
      candidate.removeItem(testKey);
      return candidate;
    } catch {
      // ignore
    }
  }

  return null;
};

export const safeStorageGetItem = (key: string): string | null => {
  const storage = getPreferredStorage();
  if (!storage) return null;
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
};

export const safeStorageSetItem = (key: string, value: string): boolean => {
  const storage = getPreferredStorage();
  if (!storage) return false;
  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

export const safeStorageRemoveItem = (key: string): void => {
  const storage = getPreferredStorage();
  if (!storage) return;
  try {
    storage.removeItem(key);
  } catch {
    // ignore
  }
};
