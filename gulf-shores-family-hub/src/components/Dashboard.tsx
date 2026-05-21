import { CalendarPlus, Camera, CloudSun, MapPin, Sparkles, StickyNote, Utensils } from "lucide-react";
import { formatDayLabel, formatLongDay, formatTimeLabel, timeToMinutes } from "@/lib/date";
import type { Photo, ScheduleItem, TripData } from "@/lib/types";
import { Button, EmptyState, ExternalAnchor, MemberStack, Panel, TypeBadge } from "./ui";

type DashboardProps = {
  data: TripData;
  today: string;
  onNavigate: (tab: "schedule" | "photos" | "restaurants" | "info") => void;
};

export function Dashboard({ data, today, onNavigate }: DashboardProps) {
  const todaysItems = data.scheduleItems
    .filter((item) => item.day === today)
    .sort((a, b) => a.time.localeCompare(b.time));
  const nextMeal = getNextMeal(todaysItems);
  const photoHighlights = getPhotoHighlights(data.photos);
  const packedCount = data.packingItems.filter((item) => item.packed).length;
  const beachSafetyLink = data.importantLinks.find((link) => link.category === "Beach safety");
  const weatherLink = data.importantLinks.find((link) => link.category === "Weather");
  const restaurantsLink = data.importantLinks.find((link) => link.category === "Restaurants");
  const attractionsLink = data.importantLinks.find((link) => link.category === "Attractions");

  return (
    <div className="dashboard">
      <section className="dashboard-hero">
        <div>
          <p className="section-kicker">Today | {formatLongDay(today)}</p>
          <h2>Beach, meals, photos, and the little details in one calm place.</h2>
        </div>
        <div className="hero-actions">
          <Button onClick={() => onNavigate("schedule")}>
            <Sparkles size={17} aria-hidden="true" />
            Suggest my day
          </Button>
          <Button variant="secondary" onClick={() => onNavigate("photos")}>
            <Camera size={17} aria-hidden="true" />
            Add photos
          </Button>
        </div>
      </section>

      <div className="dashboard-grid">
        <Panel title="Today's Plan" className="panel-large">
          {todaysItems.length > 0 ? (
            <div className="timeline compact">
              {todaysItems.map((item) => (
                <article key={item.id} className="timeline-item">
                  <time dateTime={item.time}>{formatTimeLabel(item.time)}</time>
                  <div>
                    <div className="timeline-title-row">
                      <h3>{item.title}</h3>
                      <TypeBadge type={item.type} />
                    </div>
                    <p>{item.location}</p>
                    <p className="muted">{item.notes}</p>
                    <MemberStack ids={item.assignedPeople} members={data.familyMembers} />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No plan for this day yet"
              description="Add a beach block, lunch rest time, and dinner plan to make the day easier to run."
              action={
                <Button variant="secondary" onClick={() => onNavigate("schedule")}>
                  <CalendarPlus size={16} aria-hidden="true" />
                  Add schedule
                </Button>
              }
            />
          )}
        </Panel>

        <Panel title="Weather & Beach">
          <div className="resource-list">
            {beachSafetyLink ? <ExternalAnchor href={beachSafetyLink.url}>Beach safety</ExternalAnchor> : null}
            {weatherLink ? <ExternalAnchor href={weatherLink.url}>Current forecast</ExternalAnchor> : null}
            {attractionsLink ? <ExternalAnchor href={attractionsLink.url}>Backup activities</ExternalAnchor> : null}
          </div>
          <div className="reminder-card">
            <CloudSun size={22} aria-hidden="true" />
            <p>Use official pages for live flags, surf, weather, hours, and closures.</p>
          </div>
        </Panel>

        <Panel title="Next Meal">
          {nextMeal ? (
            <div className="meal-summary">
              <Utensils size={24} aria-hidden="true" />
              <div>
                <h3>{nextMeal.title}</h3>
                <p>{formatTimeLabel(nextMeal.time)} | {nextMeal.location}</p>
                <p className="muted">{nextMeal.notes}</p>
              </div>
            </div>
          ) : (
            <EmptyState
              title="No meal picked"
              description="Choose a dinner plan from the restaurant board."
              action={
                <Button variant="secondary" onClick={() => onNavigate("restaurants")}>
                  Restaurants
                </Button>
              }
            />
          )}
          {restaurantsLink ? <ExternalAnchor href={restaurantsLink.url}>Official restaurants guide</ExternalAnchor> : null}
        </Panel>

        <Panel title="Photo Highlights" action={<button className="text-link" onClick={() => onNavigate("photos")}>Open</button>}>
          {photoHighlights.length > 0 ? (
            <div className="photo-strip">
              {photoHighlights.map((photo) => (
                <figure key={photo.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.image} alt={photo.caption} />
                  <figcaption>{photo.caption}</figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <EmptyState title="No photos yet" description="Upload the first family snapshots from the Photos tab." />
          )}
        </Panel>

        <Panel title="Quick Notes">
          <div className="note-list">
            {data.trip.notes.slice(0, 4).map((note) => (
              <div key={note.id} className="note-row">
                <StickyNote size={17} aria-hidden="true" />
                <span>{note.text}</span>
              </div>
            ))}
          </div>
          <Button variant="secondary" onClick={() => onNavigate("info")}>Edit trip info</Button>
        </Panel>

        <Panel title="Trip Snapshot">
          <div className="snapshot-list">
            <div>
              <MapPin size={17} aria-hidden="true" />
              <span>{data.trip.lodging.address}</span>
            </div>
            <div>
              <CalendarPlus size={17} aria-hidden="true" />
              <span>{formatDayLabel(data.trip.startDate)} to {formatDayLabel(data.trip.endDate)}</span>
            </div>
            <div>
              <Sparkles size={17} aria-hidden="true" />
              <span>{packedCount}/{data.packingItems.length} packing items ready</span>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function getNextMeal(items: ScheduleItem[]) {
  const meals = items.filter((item) => item.type === "meal").sort((a, b) => a.time.localeCompare(b.time));
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();

  return meals.find((meal) => timeToMinutes(meal.time) >= minutes) ?? meals[0];
}

function getPhotoHighlights(photos: Photo[]) {
  return [...photos]
    .sort((a, b) => {
      const favoriteDiff = Number(b.favorites.length > 0) - Number(a.favorites.length > 0);
      if (favoriteDiff !== 0) {
        return favoriteDiff;
      }
      return b.createdAt.localeCompare(a.createdAt);
    })
    .slice(0, 3);
}
