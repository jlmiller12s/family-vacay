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
      const parsed = JSON.parse(raw) as Partial<TripData>;
      const normalized = normalizeTripData(parsed);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      return normalized;
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

export function normalizeTripData(data: Partial<TripData>): TripData {
  const seeded = createSeedData();

  return {
    ...seeded,
    ...data,
    trip: {
      ...seeded.trip,
      ...data.trip,
      lodging: {
        ...seeded.trip.lodging,
        ...data.trip?.lodging,
      },
      notes: data.trip?.notes ?? seeded.trip.notes,
    },
    familyMembers: data.familyMembers ?? seeded.familyMembers,
    scheduleItems: data.scheduleItems ?? seeded.scheduleItems,
    restaurants: data.restaurants ?? seeded.restaurants,
    photos: data.photos ?? seeded.photos,
    packingItems: data.packingItems ?? seeded.packingItems,
    importantLinks: data.importantLinks ?? seeded.importantLinks,
    suggestions: data.suggestions ?? seeded.suggestions,
  };
}

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
