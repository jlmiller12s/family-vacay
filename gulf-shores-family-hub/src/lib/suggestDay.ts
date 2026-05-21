import { createId } from "./id";
import type { ScheduleItem, SuggestedDayInput } from "./types";

type SuggestOptions = SuggestedDayInput & {
  familyMemberIds: string[];
};

const dinnerTitles: Record<SuggestedDayInput["mealPreference"], string> = {
  "easy-casual": "Easy casual dinner",
  seafood: "Seafood dinner",
  "nice-dinner": "Nice dinner reservation",
  "kid-first": "Early kid-friendly dinner",
};

export function generateSuggestedDay(input: SuggestOptions): ScheduleItem[] {
  const assignedPeople = input.familyMemberIds;
  const beachSafetyLink = "https://www.gulfshoresal.gov/beachsafety";
  const attractionsLink = "https://www.gulfshores.com/things-to-do/attractions/";
  const schedule: ScheduleItem[] = [];

  if (input.beachFirst) {
    schedule.push({
      id: createId("suggested"),
      day: input.day,
      time: "08:15",
      title: "Beach-first morning setup",
      type: "beach",
      location: "Closest safe beach access",
      notes: "Check current flags and surf guidance before anyone swims. Pack shade, water, and snacks.",
      assignedPeople,
      reservationLink: beachSafetyLink,
    });
  } else {
    schedule.push({
      id: createId("suggested"),
      day: input.day,
      time: "09:00",
      title: "Slow breakfast and flexible morning",
      type: "rest",
      location: "Condo",
      notes: "Keep the morning easy, then decide between pool time, a short walk, or an attraction.",
      assignedPeople,
    });
  }

  schedule.push({
    id: createId("suggested"),
    day: input.day,
    time: "12:00",
    title: "Lunch, showers, and cool-down",
    type: "rest",
    location: "Condo",
    notes: "Quiet hour, refill water bottles, reset beach gear, and check the afternoon forecast.",
    assignedPeople,
  });

  schedule.push({
    id: createId("suggested"),
    day: input.day,
    time: "15:30",
    title: input.rainyBackup ? "Rainy day / rough water backup" : "Optional attraction or pool downtime",
    type: input.rainyBackup ? "backup" : "activity",
    location: input.rainyBackup ? "Indoor attraction shortlist" : "Gulf Shores / Orange Beach",
    notes: input.rainyBackup
      ? "Use the official attractions guide and choose an indoor or low-water plan close to lodging."
      : "Keep it flexible. Choose a short attraction, pool time, or a rest block depending on energy.",
    assignedPeople,
    reservationLink: attractionsLink,
  });

  if (input.familyPhotoTime) {
    schedule.push({
      id: createId("suggested"),
      day: input.day,
      time: input.familyPhotoTime,
      title: "Family photos around golden hour",
      type: "photo",
      location: "Beach access near dunes",
      notes: "Lay outfits out during rest time. Bring a lint roller, water, and backup snacks.",
      assignedPeople,
    });
  }

  schedule.push({
    id: createId("suggested"),
    day: input.day,
    time: input.mealPreference === "kid-first" ? "17:30" : input.familyPhotoTime ? "19:30" : "18:30",
    title: input.restaurantName
      ? `${dinnerTitles[input.mealPreference]} at ${input.restaurantName}`
      : dinnerTitles[input.mealPreference],
    type: "meal",
    location: input.restaurantName ?? "Restaurant board pick",
    notes: input.restaurantName
      ? "Confirm hours, reservation status, and drive time before leaving."
      : "Pick from the restaurant board and use the official restaurants guide for current details.",
    assignedPeople,
    reservationLink: "https://www.gulfshores.com/restaurants/",
  });

  return schedule.sort((a, b) => a.time.localeCompare(b.time));
}
