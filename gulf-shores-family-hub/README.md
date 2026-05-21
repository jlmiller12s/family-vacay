# Gulf Shores Family Hub

A private, local-first vacation dashboard for a family trip to Gulf Shores, Alabama. The app includes a daily dashboard, schedule planner, family photo uploads, restaurant board, packing list, trip info, and a "suggest my day" schedule generator.

The Suggestions tab lets family members add activity or restaurant ideas, vote on them, and review AI Picks. AI Picks is a private local recommendation engine for the prototype; it scores suggestions in the browser from votes, notes, category, location, and planning cautions rather than sending family data to an external AI service.

## Run Locally

```bash
npm install
npm run dev
```

Open the local URL printed by Next.js, usually `http://localhost:3000`.

Useful checks:

```bash
npm test
npm run build
```

## Where Data Is Stored

Prototype data is stored in the browser's `localStorage` under:

```text
gulf-shores-family-hub:v1
```

Uploaded photos are converted to browser data URLs and saved in that same local record. Suggestions, votes, and AI Pick inputs are stored there too. This makes the prototype work without accounts, but it also means photos and votes are only available on the same browser/device and are limited by browser storage size. Use the in-app reset button to restore the editable sample trip.

## Future Shared Version

The app keeps persistence behind `TripDataRepository` in `src/lib/storage.ts`. A shared family version can replace the local repository with:

- Supabase or Firebase Auth for private family sign-in.
- A database table/collection for trips, family members, schedule items, restaurants, packing items, notes, and important links.
- A suggestions/votes table so each signed-in family member gets one vote per idea.
- A server-side AI recommendation route if you later want model-generated recommendations with explicit privacy controls.
- Supabase Storage, Firebase Storage, or another object store for original photo files and thumbnails.
- Row-level security or per-trip membership rules so the hub stays private.

## Resource Links

Live beach, weather, restaurant, attraction, and reservation details are linked to official/current resources rather than hardcoded in the app:

- City of Gulf Shores Beach Safety: https://www.gulfshoresal.gov/beachsafety
- Official Gulf Shores & Orange Beach restaurants: https://www.gulfshores.com/restaurants/
- Official Gulf Shores & Orange Beach attractions: https://www.gulfshores.com/things-to-do/attractions/
- NOAA / National Weather Service forecast link for Gulf Shores sample coordinates
