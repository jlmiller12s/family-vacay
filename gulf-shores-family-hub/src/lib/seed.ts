import { addDays, toIsoDate } from "./date";
import type { ImportantLink, Photo, ScheduleItem, TripData } from "./types";

function samplePhoto(title: string, subtitle: string, start: string, end: string): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="960" height="640" viewBox="0 0 960 640">
      <defs>
        <linearGradient id="sky" x1="0" x2="1" y1="0" y2="1">
          <stop stop-color="${start}" offset="0"/>
          <stop stop-color="${end}" offset="1"/>
        </linearGradient>
        <linearGradient id="water" x1="0" x2="1">
          <stop stop-color="#1c91a5" offset="0"/>
          <stop stop-color="#7bc8c4" offset="1"/>
        </linearGradient>
      </defs>
      <rect width="960" height="640" fill="url(#sky)"/>
      <circle cx="785" cy="132" r="70" fill="#ffe28a"/>
      <path d="M0 348 C140 314 230 382 360 344 C520 297 630 373 760 335 C850 310 902 318 960 303 L960 640 L0 640 Z" fill="url(#water)" opacity=".9"/>
      <path d="M0 456 C130 432 243 486 370 458 C525 424 629 491 781 449 C857 428 919 433 960 416 L960 640 L0 640 Z" fill="#f4d7a4"/>
      <path d="M0 515 C196 485 316 544 499 508 C690 471 795 530 960 487 L960 640 L0 640 Z" fill="#fff7e4" opacity=".86"/>
      <text x="54" y="92" fill="#123444" font-family="Arial, sans-serif" font-size="46" font-weight="700">${title}</text>
      <text x="56" y="142" fill="#123444" font-family="Arial, sans-serif" font-size="24" opacity=".78">${subtitle}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function createSeedData(baseDate = new Date()): TripData {
  const start = toIsoDate(baseDate);
  const days = Array.from({ length: 6 }, (_, index) => toIsoDate(addDays(baseDate, index)));
  const end = days[days.length - 1];

  const familyMembers = [
    { id: "m-dana", name: "Dana", role: "Planner", color: "#0f8b8d", avatar: "DA" },
    { id: "m-mike", name: "Mike", role: "Driver", color: "#ee6c4d", avatar: "MI" },
    { id: "m-nana", name: "Nana", role: "Snack lead", color: "#7a5cff", avatar: "NA" },
    { id: "m-kids", name: "Kids", role: "Shell scouts", color: "#f5a524", avatar: "KS" },
  ];

  const scheduleItems: ScheduleItem[] = [
    {
      id: "schedule-arrive",
      day: days[0],
      time: "10:00",
      title: "Arrive, unload, and stock the fridge",
      type: "travel",
      location: "Condo",
      notes: "Grab groceries before everyone gets sandy. Keep swimsuits accessible.",
      assignedPeople: ["m-dana", "m-mike"],
    },
    {
      id: "schedule-beach-1",
      day: days[0],
      time: "15:30",
      title: "Easy beach walk and first dip",
      type: "beach",
      location: "Public beach access",
      notes: "Check flags before going in. Keep it light after travel.",
      assignedPeople: ["m-dana", "m-mike", "m-nana", "m-kids"],
      reservationLink: "https://www.gulfshoresal.gov/beachsafety",
    },
    {
      id: "schedule-dinner-1",
      day: days[0],
      time: "18:30",
      title: "Casual seafood dinner",
      type: "meal",
      location: "The Hangout area",
      notes: "Use the restaurant board to pick the final spot.",
      assignedPeople: ["m-dana", "m-mike", "m-nana", "m-kids"],
      reservationLink: "https://www.gulfshores.com/restaurants/",
    },
    {
      id: "schedule-beach-2",
      day: days[1],
      time: "08:30",
      title: "Morning beach block",
      type: "beach",
      location: "Main beach setup",
      notes: "Umbrella, cooler, sunscreen timer, shell bucket.",
      assignedPeople: ["m-mike", "m-kids"],
      reservationLink: "https://www.gulfshoresal.gov/beachsafety",
    },
    {
      id: "schedule-rest-2",
      day: days[1],
      time: "12:00",
      title: "Lunch, showers, and cool-down",
      type: "rest",
      location: "Condo",
      notes: "Quiet time, naps, refill water bottles.",
      assignedPeople: ["m-dana", "m-nana"],
    },
    {
      id: "schedule-activity-2",
      day: days[1],
      time: "15:30",
      title: "Pick an easy attraction or pool time",
      type: "activity",
      location: "Gulf Shores / Orange Beach",
      notes: "Use official attractions link if the weather is cooperative.",
      assignedPeople: ["m-dana", "m-mike", "m-kids"],
      reservationLink: "https://www.gulfshores.com/things-to-do/attractions/",
    },
    {
      id: "schedule-dinner-2",
      day: days[1],
      time: "18:15",
      title: "Kid-friendly dinner",
      type: "meal",
      location: "Beachside casual option",
      notes: "Early dinner keeps bedtime easier.",
      assignedPeople: ["m-dana", "m-mike", "m-nana", "m-kids"],
    },
    {
      id: "schedule-beach-3",
      day: days[2],
      time: "08:15",
      title: "Beach morning and sandcastle contest",
      type: "beach",
      location: "Condo beach access",
      notes: "Bring small bills for chair rentals if needed.",
      assignedPeople: ["m-dana", "m-mike", "m-nana", "m-kids"],
      reservationLink: "https://www.gulfshoresal.gov/beachsafety",
    },
    {
      id: "schedule-photo-3",
      day: days[2],
      time: "18:45",
      title: "Family photos at golden hour",
      type: "photo",
      location: "Beach access near dunes",
      notes: "Outfits: blues, whites, soft coral. Steam shirts during rest time.",
      assignedPeople: ["m-dana", "m-mike", "m-nana", "m-kids"],
    },
    {
      id: "schedule-dinner-3",
      day: days[2],
      time: "19:30",
      title: "Nice dinner after photos",
      type: "meal",
      location: "Reservation-needed shortlist",
      notes: "Book ahead and keep the kids' snacks handy after photos.",
      assignedPeople: ["m-dana", "m-mike", "m-nana", "m-kids"],
    },
    {
      id: "schedule-backup-4",
      day: days[3],
      time: "10:00",
      title: "Rainy day / rough water backup",
      type: "backup",
      location: "Indoor attraction or arcade",
      notes: "Check official attractions guide, then choose something close by.",
      assignedPeople: ["m-dana", "m-mike", "m-kids"],
      reservationLink: "https://www.gulfshores.com/things-to-do/attractions/",
    },
  ];

  const photos: Photo[] = [
    {
      id: "photo-sunset",
      image: samplePhoto("Sunset Shell Hunt", "Sample highlight", "#fbccb0", "#77c8d1"),
      day: days[0],
      caption: "First evening shell hunt",
      uploadedBy: "Dana",
      favorites: ["family"],
      createdAt: new Date(`${days[0]}T19:20:00`).toISOString(),
    },
    {
      id: "photo-morning",
      image: samplePhoto("Beach Morning", "Sample highlight", "#bfeef0", "#7cb7df"),
      day: days[1],
      caption: "Umbrella spot before breakfast wore off",
      uploadedBy: "Mike",
      favorites: [],
      createdAt: new Date(`${days[1]}T09:10:00`).toISOString(),
    },
  ];

  const importantLinks: ImportantLink[] = [
    {
      id: "link-beach-safety",
      title: "City of Gulf Shores Beach Safety",
      url: "https://www.gulfshoresal.gov/beachsafety",
      category: "Beach safety",
    },
    {
      id: "link-weather",
      title: "NOAA / National Weather Service Forecast",
      url: "https://forecast.weather.gov/MapClick.php?lat=30.246&lon=-87.7008",
      category: "Weather",
    },
    {
      id: "link-restaurants",
      title: "Official Restaurants Guide",
      url: "https://www.gulfshores.com/restaurants/",
      category: "Restaurants",
    },
    {
      id: "link-attractions",
      title: "Official Attractions Guide",
      url: "https://www.gulfshores.com/things-to-do/attractions/",
      category: "Attractions",
    },
  ];

  return {
    trip: {
      title: "Gulf Shores Family Hub",
      startDate: start,
      endDate: end,
      lodging: {
        name: "Sample Gulf Shores Condo",
        address: "101 Gulf-front Drive, Gulf Shores, AL",
        checkIn: "4:00 PM",
        checkOut: "10:00 AM",
        parkingNotes: "Two parking passes in the welcome binder. Keep one in the beach bag.",
      },
      emergencyInfo:
        "For emergencies call 911. Keep urgent care, pharmacy, and condo host numbers here once confirmed.",
      photoOutfitNotes:
        "Family photo palette: soft blues, white, chambray, and one coral accent. Avoid neon and tiny stripes.",
      notes: [
        { id: "note-flags", text: "Check beach flags before each swim block.", pinned: true },
        { id: "note-cooler", text: "Refill cooler ice after breakfast and before dinner.", pinned: true },
        { id: "note-sunscreen", text: "Sunscreen timer every 80 minutes, especially after water time." },
      ],
    },
    familyMembers,
    scheduleItems,
    restaurants: [
      {
        id: "restaurant-hangout",
        name: "The Hangout",
        category: ["kid-friendly", "casual", "near the beach"],
        notes: "Classic family energy near the public beach. Good first-night fallback.",
        priceLevel: "$$",
        familyRating: 4,
        reservationStatus: "none",
        link: "https://www.gulfshores.com/restaurants/",
        favorite: true,
      },
      {
        id: "restaurant-lulus",
        name: "LuLu's Gulf Shores",
        category: ["kid-friendly", "seafood", "casual"],
        notes: "Outdoor play area and a menu that works for mixed ages.",
        priceLevel: "$$",
        familyRating: 5,
        reservationStatus: "considering",
        link: "https://www.gulfshores.com/restaurants/",
        favorite: true,
      },
      {
        id: "restaurant-fisher",
        name: "Fisher's / nice dinner idea",
        category: ["seafood", "nice dinner", "needs reservation"],
        notes: "Use as an editable placeholder for the family-photo dinner night.",
        priceLevel: "$$$",
        familyRating: 4,
        reservationStatus: "needed",
        link: "https://www.gulfshores.com/restaurants/",
        favorite: false,
      },
    ],
    photos,
    packingItems: [
      { id: "pack-sunscreen", name: "Mineral sunscreen and face sticks", category: "Beach gear", packed: false },
      { id: "pack-umbrella", name: "Umbrella / shade tent", category: "Beach gear", packed: false },
      { id: "pack-towels", name: "Beach towels", category: "Beach gear", packed: true },
      { id: "pack-outfits", name: "Family photo outfits", category: "Clothes", packed: false },
      { id: "pack-meds", name: "Kids meds, bandages, aloe", category: "Health", packed: false },
      { id: "pack-snacks", name: "Breakfast groceries and snacks", category: "Kitchen", packed: false },
      { id: "pack-chargers", name: "Chargers and battery pack", category: "Travel", packed: true },
    ],
    importantLinks,
  };
}
