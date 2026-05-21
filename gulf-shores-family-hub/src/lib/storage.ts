"use client";

import { useEffect, useMemo, useState } from "react";
import { createSeedData } from "./seed";
import type { TripData } from "./types";

const STORAGE_KEY = "gulf-shores-family-hub:v1";

export type TripDataRepository = {
  load: () => TripData;
  save: (data: TripData) => void;
  reset: () => TripData;
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export const localTripDataRepository: TripDataRepository = {
  load() {
    if (!canUseStorage()) {
      return createSeedData();
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      const seeded = createSeedData();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }

    try {
      return JSON.parse(raw) as TripData;
    } catch {
      const seeded = createSeedData();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
  },
  save(data) {
    if (canUseStorage()) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  },
  reset() {
    const seeded = createSeedData();
    if (canUseStorage()) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    }
    return seeded;
  },
};

export function useTripData(repository: TripDataRepository = localTripDataRepository) {
  const [data, setData] = useState<TripData>(() => createSeedData());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Browser storage is only available after mount in this local-first prototype.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(repository.load());
    setHydrated(true);
  }, [repository]);

  useEffect(() => {
    if (hydrated) {
      repository.save(data);
    }
  }, [data, hydrated, repository]);

  return useMemo(
    () => ({
      data,
      setData,
      hydrated,
      resetData: () => setData(repository.reset()),
    }),
    [data, hydrated, repository],
  );
}

export const storageDetails = {
  storageKey: STORAGE_KEY,
  strategy:
    "All prototype data, including uploaded photo data URLs, is stored in this browser's localStorage.",
};
