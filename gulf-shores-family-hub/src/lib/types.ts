export type ScheduleType =
  | "beach"
  | "meal"
  | "rest"
  | "activity"
  | "photo"
  | "backup"
  | "travel"
  | "note";

export type RestaurantCategory =
  | "kid-friendly"
  | "seafood"
  | "casual"
  | "nice dinner"
  | "near the beach"
  | "needs reservation";

export type PackingCategory =
  | "Clothes"
  | "Beach gear"
  | "Kitchen"
  | "Kids"
  | "Health"
  | "Travel";

export type LinkCategory = "Beach safety" | "Weather" | "Restaurants" | "Attractions" | "Lodging" | "Emergency";

export type FamilyMember = {
  id: string;
  name: string;
  role: string;
  color: string;
  avatar: string;
};

export type TripNote = {
  id: string;
  text: string;
  pinned?: boolean;
};

export type LodgingInfo = {
  name: string;
  address: string;
  checkIn: string;
  checkOut: string;
  parkingNotes: string;
};

export type Trip = {
  title: string;
  startDate: string;
  endDate: string;
  lodging: LodgingInfo;
  emergencyInfo: string;
  photoOutfitNotes: string;
  notes: TripNote[];
};

export type ScheduleItem = {
  id: string;
  day: string;
  time: string;
  title: string;
  type: ScheduleType;
  location: string;
  notes: string;
  assignedPeople: string[];
  reservationLink?: string;
};

export type Restaurant = {
  id: string;
  name: string;
  category: RestaurantCategory[];
  notes: string;
  priceLevel: "$" | "$$" | "$$$" | "$$$$";
  familyRating: number;
  reservationStatus: "none" | "considering" | "needed" | "booked";
  link: string;
  favorite: boolean;
};

export type Photo = {
  id: string;
  image: string;
  day: string;
  caption: string;
  uploadedBy: string;
  favorites: string[];
  createdAt: string;
};

export type PackingItem = {
  id: string;
  name: string;
  category: PackingCategory;
  packed: boolean;
};

export type ImportantLink = {
  id: string;
  title: string;
  url: string;
  category: LinkCategory;
};

export type TripData = {
  trip: Trip;
  familyMembers: FamilyMember[];
  scheduleItems: ScheduleItem[];
  restaurants: Restaurant[];
  photos: Photo[];
  packingItems: PackingItem[];
  importantLinks: ImportantLink[];
};

export type SuggestedDayInput = {
  day: string;
  mealPreference: "easy-casual" | "seafood" | "nice-dinner" | "kid-first";
  beachFirst: boolean;
  familyPhotoTime: string;
  restaurantName?: string;
  rainyBackup: boolean;
};
