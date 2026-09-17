"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "duynhan-recently-viewed";
const MAX_ITEMS = 8;

function readIds(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value > 0)
      .slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

export function useRecentlyViewed() {
  const [ids, setIds] = useState<number[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIds(readIds());
    setReady(true);
  }, []);

  const trackView = useCallback((productId: number) => {
    setIds((current) => {
      const next = [
        productId,
        ...current.filter((id) => id !== productId),
      ].slice(0, MAX_ITEMS);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { ids, trackView, ready };
}
