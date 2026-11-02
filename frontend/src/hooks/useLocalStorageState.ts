import { useCallback, useState } from "react";

// Like useState, but the value is remembered in localStorage under the given key.
// Falls back to the default when storage is unavailable or holds something unreadable.
export function useLocalStorageState<T>(key: string, defaultValue: T) {
    const [value, setValue] = useState<T>(() => {
        try {
            const stored = localStorage.getItem(key);
            return stored === null ? defaultValue : (JSON.parse(stored) as T);
        } catch {
            return defaultValue;
        }
    });

    const update = useCallback(
        (next: T) => {
            setValue(next);
            try {
                localStorage.setItem(key, JSON.stringify(next));
            } catch {
                // Storage can be full or blocked (private mode); the setting then lasts for this session only.
            }
        },
        [key],
    );

    return [value, update] as const;
}