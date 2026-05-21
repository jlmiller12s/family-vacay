"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";
import { useMemo, useState } from "react";
import { CalendarPlus, Edit3, Plus, Sparkles, Trash2 } from "lucide-react";
import { formatDayLabel, formatLongDay, getTripDays } from "@/lib/date";
import { createId } from "@/lib/id";
import { generateSuggestedDay } from "@/lib/suggestDay";
import type { ScheduleItem, ScheduleType, SuggestedDayInput, TripData } from "@/lib/types";
import { Button, EmptyState, ExternalAnchor, Field, IconButton, MemberStack, Panel, TypeBadge, cx } from "./ui";

type SchedulePlannerProps = {
  data: TripData;
  setData: Dispatch<SetStateAction<TripData>>;
  today: string;
};

type ScheduleFormState = Omit<ScheduleItem, "id"> & {
  id?: string;
};

const scheduleTypes: ScheduleType[] = ["beach", "meal", "rest", "activity", "photo", "backup", "travel", "note"];

export function SchedulePlanner({ data, setData, today }: SchedulePlannerProps) {
  const days = useMemo(() => getTripDays(data.trip.startDate, data.trip.endDate), [data.trip.startDate, data.trip.endDate]);
  const [selectedDay, setSelectedDay] = useState(today);
  const [form, setForm] = useState<ScheduleFormState>(() => blankSchedule(today, data.familyMembers.map((member) => member.id)));
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [suggestInput, setSuggestInput] = useState<SuggestedDayInput>({
    day: today,
    mealPreference: "easy-casual",
    beachFirst: true,
    familyPhotoTime: "18:45",
    restaurantName: data.restaurants.find((restaurant) => restaurant.favorite)?.name,
    rainyBackup: false,
  });
  const [suggestedItems, setSuggestedItems] = useState<ScheduleItem[]>([]);

  const visibleItems = data.scheduleItems
    .filter((item) => item.day === selectedDay)
    .sort((a, b) => a.time.localeCompare(b.time));
  const beachSafetyLink = data.importantLinks.find((link) => link.category === "Beach safety");
  const attractionsLink = data.importantLinks.find((link) => link.category === "Attractions");

  function openCreateForm(day = selectedDay) {
    setForm(blankSchedule(day, data.familyMembers.map((member) => member.id)));
    setIsFormOpen(true);
  }

  function openEditForm(item: ScheduleItem) {
    setForm({ ...item });
    setIsFormOpen(true);
  }

  function saveScheduleItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const item: ScheduleItem = {
      id: form.id ?? createId("schedule"),
      day: form.day,
      time: form.time,
      title: form.title.trim(),
      type: form.type,
      location: form.location.trim(),
      notes: form.notes.trim(),
      assignedPeople: form.assignedPeople,
      reservationLink: form.reservationLink?.trim() || undefined,
    };

    if (!item.title) {
      return;
    }

    setData((current) => ({
      ...current,
      scheduleItems: form.id
        ? current.scheduleItems.map((existing) => (existing.id === form.id ? item : existing))
        : [...current.scheduleItems, item],
    }));
    setSelectedDay(item.day);
    setIsFormOpen(false);
    setForm(blankSchedule(item.day, data.familyMembers.map((member) => member.id)));
  }

  function deleteScheduleItem(itemId: string) {
    setData((current) => ({
      ...current,
      scheduleItems: current.scheduleItems.filter((item) => item.id !== itemId),
    }));
  }

  function toggleAssigned(memberId: string) {
    setForm((current) => ({
      ...current,
      assignedPeople: current.assignedPeople.includes(memberId)
        ? current.assignedPeople.filter((id) => id !== memberId)
        : [...current.assignedPeople, memberId],
    }));
  }

  function generatePlan() {
    setSuggestedItems(
      generateSuggestedDay({
        ...suggestInput,
        familyMemberIds: data.familyMembers.map((member) => member.id),
      }),
    );
  }

  function addSuggestedItems(items: ScheduleItem[]) {
    setData((current) => ({
      ...current,
      scheduleItems: [
        ...current.scheduleItems,
        ...items.map((item) => ({
          ...item,
          id: createId("schedule"),
        })),
      ],
    }));
    setSelectedDay(items[0]?.day ?? selectedDay);
  }

  return (
    <div className="workspace-grid schedule-workspace">
      <Panel
        title="Schedule Planner"
        className="workspace-main"
        action={
          <Button onClick={() => openCreateForm()}>
            <Plus size={16} aria-hidden="true" />
            Add item
          </Button>
        }
      >
        <div className="day-tabs" role="tablist" aria-label="Trip days">
          {days.map((day) => (
            <button
              key={day}
              className={cx("day-tab", day === selectedDay && "day-tab-active")}
              onClick={() => {
                setSelectedDay(day);
                setForm((current) => ({ ...current, day }));
              }}
            >
              <span>{formatDayLabel(day)}</span>
              {day === today ? <strong>Today</strong> : null}
            </button>
          ))}
        </div>

        <div className="section-row">
          <div>
            <p className="section-kicker">Plan for</p>
            <h3>{formatLongDay(selectedDay)}</h3>
          </div>
          <div className="inline-links">
            {beachSafetyLink ? <ExternalAnchor href={beachSafetyLink.url}>Beach safety</ExternalAnchor> : null}
            {attractionsLink ? <ExternalAnchor href={attractionsLink.url}>Backup ideas</ExternalAnchor> : null}
          </div>
        </div>

        {visibleItems.length > 0 ? (
          <div className="timeline">
            {visibleItems.map((item) => (
              <article key={item.id} className="timeline-item editable-item">
                <time>{item.time}</time>
                <div>
                  <div className="timeline-title-row">
                    <h3>{item.title}</h3>
                    <TypeBadge type={item.type} />
                  </div>
                  <p>{item.location}</p>
                  <p className="muted">{item.notes}</p>
                  {item.reservationLink ? <ExternalAnchor href={item.reservationLink}>Reservation / reference</ExternalAnchor> : null}
                  <div className="item-footer">
                    <MemberStack ids={item.assignedPeople} members={data.familyMembers} />
                    <div className="icon-row">
                      <IconButton label={`Edit ${item.title}`} onClick={() => openEditForm(item)}>
                        <Edit3 size={16} aria-hidden="true" />
                      </IconButton>
                      <IconButton label={`Delete ${item.title}`} variant="danger" onClick={() => deleteScheduleItem(item.id)}>
                        <Trash2 size={16} aria-hidden="true" />
                      </IconButton>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="This day is wide open"
            description="Add a morning beach plan, a cool-down block, a flexible afternoon, and dinner."
            action={
              <Button variant="secondary" onClick={() => openCreateForm(selectedDay)}>
                <CalendarPlus size={16} aria-hidden="true" />
                Create first item
              </Button>
            }
          />
        )}
      </Panel>

      <aside className="workspace-side">
        <Panel title="Suggest My Day">
          <div className="suggest-card">
            <Field label="Trip day">
              <select
                value={suggestInput.day}
                onChange={(event) => setSuggestInput((current) => ({ ...current, day: event.target.value }))}
              >
                {days.map((day) => (
                  <option key={day} value={day}>
                    {formatLongDay(day)}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Dinner mood">
              <select
                value={suggestInput.mealPreference}
                onChange={(event) =>
                  setSuggestInput((current) => ({
                    ...current,
                    mealPreference: event.target.value as SuggestedDayInput["mealPreference"],
                  }))
                }
              >
                <option value="easy-casual">Easy casual</option>
                <option value="seafood">Seafood</option>
                <option value="nice-dinner">Nice dinner</option>
                <option value="kid-first">Kid-first early meal</option>
              </select>
            </Field>

            <Field label="Restaurant choice">
              <select
                value={suggestInput.restaurantName ?? ""}
                onChange={(event) =>
                  setSuggestInput((current) => ({
                    ...current,
                    restaurantName: event.target.value || undefined,
                  }))
                }
              >
                <option value="">Pick later</option>
                {data.restaurants.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.name}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Family photo time">
              <input
                type="time"
                value={suggestInput.familyPhotoTime}
                onChange={(event) => setSuggestInput((current) => ({ ...current, familyPhotoTime: event.target.value }))}
              />
            </Field>

            <div className="checkbox-stack">
              <label>
                <input
                  type="checkbox"
                  checked={suggestInput.beachFirst}
                  onChange={(event) => setSuggestInput((current) => ({ ...current, beachFirst: event.target.checked }))}
                />
                Beach-first morning
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={suggestInput.rainyBackup}
                  onChange={(event) => setSuggestInput((current) => ({ ...current, rainyBackup: event.target.checked }))}
                />
                Rainy / rough water backup
              </label>
            </div>

            <Button onClick={generatePlan}>
              <Sparkles size={16} aria-hidden="true" />
              Generate schedule
            </Button>
          </div>

          {suggestedItems.length > 0 ? (
            <div className="suggested-list">
              <div className="section-row">
                <h3>Suggested plan</h3>
                <Button variant="secondary" onClick={() => addSuggestedItems(suggestedItems)}>
                  Add all
                </Button>
              </div>
              {suggestedItems.map((item) => (
                <article key={item.id} className="suggested-item">
                  <time>{item.time}</time>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.notes}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </Panel>

        {isFormOpen ? (
          <Panel title={form.id ? "Edit schedule item" : "New schedule item"}>
            <form className="stack-form" onSubmit={saveScheduleItem}>
              <Field label="Day">
                <select value={form.day} onChange={(event) => setForm((current) => ({ ...current, day: event.target.value }))}>
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {formatLongDay(day)}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="form-grid">
                <Field label="Time">
                  <input value={form.time} type="time" onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))} />
                </Field>
                <Field label="Type">
                  <select
                    value={form.type}
                    onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as ScheduleType }))}
                  >
                    {scheduleTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Title">
                <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
              </Field>
              <Field label="Location">
                <input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} />
              </Field>
              <Field label="Notes">
                <textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} rows={3} />
              </Field>
              <Field label="Reservation or reference link">
                <input
                  value={form.reservationLink ?? ""}
                  onChange={(event) => setForm((current) => ({ ...current, reservationLink: event.target.value }))}
                  placeholder="https://"
                />
              </Field>
              <div className="checkbox-stack">
                <span className="field-label">Assigned people</span>
                {data.familyMembers.map((member) => (
                  <label key={member.id}>
                    <input
                      type="checkbox"
                      checked={form.assignedPeople.includes(member.id)}
                      onChange={() => toggleAssigned(member.id)}
                    />
                    {member.name}
                  </label>
                ))}
              </div>
              <div className="form-actions">
                <Button type="submit">{form.id ? "Save item" : "Create item"}</Button>
                <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Panel>
        ) : null}
      </aside>
    </div>
  );
}

function blankSchedule(day: string, assignedPeople: string[]): ScheduleFormState {
  return {
    day,
    time: "08:30",
    title: "",
    type: "beach",
    location: "",
    notes: "",
    assignedPeople,
    reservationLink: "",
  };
}
