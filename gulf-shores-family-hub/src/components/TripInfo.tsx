"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";
import { useState } from "react";
import { CheckCircle2, Edit3, Link as LinkIcon, ListPlus, MapPin, Plus, Trash2 } from "lucide-react";
import { createId } from "@/lib/id";
import type { ImportantLink, LinkCategory, PackingCategory, PackingItem, TripData } from "@/lib/types";
import { Button, EmptyState, ExternalAnchor, Field, IconButton, Panel, cx } from "./ui";

type TripInfoProps = {
  data: TripData;
  setData: Dispatch<SetStateAction<TripData>>;
};

type PackingFormState = Omit<PackingItem, "id"> & {
  id?: string;
};

type LinkFormState = Omit<ImportantLink, "id"> & {
  id?: string;
};

const packingCategories: PackingCategory[] = ["Clothes", "Beach gear", "Kitchen", "Kids", "Health", "Travel"];
const linkCategories: LinkCategory[] = ["Beach safety", "Weather", "Restaurants", "Attractions", "Lodging", "Emergency"];

export function TripInfo({ data, setData }: TripInfoProps) {
  const [newNote, setNewNote] = useState("");
  const [packingFilter, setPackingFilter] = useState<PackingCategory | "all">("all");
  const [packingForm, setPackingForm] = useState<PackingFormState>(blankPackingItem());
  const [linkForm, setLinkForm] = useState<LinkFormState>(blankImportantLink());
  const beachGear = data.packingItems.filter((item) => item.category === "Beach gear");
  const visiblePacking = data.packingItems.filter((item) => packingFilter === "all" || item.category === packingFilter);
  const packedCount = data.packingItems.filter((item) => item.packed).length;

  function updateTripField(path: "title" | "emergencyInfo" | "photoOutfitNotes", value: string) {
    setData((current) => ({
      ...current,
      trip: {
        ...current.trip,
        [path]: value,
      },
    }));
  }

  function updateLodgingField(field: keyof TripData["trip"]["lodging"], value: string) {
    setData((current) => ({
      ...current,
      trip: {
        ...current.trip,
        lodging: {
          ...current.trip.lodging,
          [field]: value,
        },
      },
    }));
  }

  function addNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = newNote.trim();
    if (!text) {
      return;
    }
    setData((current) => ({
      ...current,
      trip: {
        ...current.trip,
        notes: [...current.trip.notes, { id: createId("note"), text }],
      },
    }));
    setNewNote("");
  }

  function updateNote(noteId: string, text: string) {
    setData((current) => ({
      ...current,
      trip: {
        ...current.trip,
        notes: current.trip.notes.map((note) => (note.id === noteId ? { ...note, text } : note)),
      },
    }));
  }

  function deleteNote(noteId: string) {
    setData((current) => ({
      ...current,
      trip: {
        ...current.trip,
        notes: current.trip.notes.filter((note) => note.id !== noteId),
      },
    }));
  }

  function togglePacked(itemId: string) {
    setData((current) => ({
      ...current,
      packingItems: current.packingItems.map((item) => (item.id === itemId ? { ...item, packed: !item.packed } : item)),
    }));
  }

  function editPackingItem(item: PackingItem) {
    setPackingForm({ ...item });
  }

  function savePackingItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const item: PackingItem = {
      id: packingForm.id ?? createId("pack"),
      name: packingForm.name.trim(),
      category: packingForm.category,
      packed: packingForm.packed,
    };

    if (!item.name) {
      return;
    }

    setData((current) => ({
      ...current,
      packingItems: packingForm.id
        ? current.packingItems.map((existing) => (existing.id === packingForm.id ? item : existing))
        : [...current.packingItems, item],
    }));
    setPackingForm(blankPackingItem());
  }

  function deletePackingItem(itemId: string) {
    setData((current) => ({
      ...current,
      packingItems: current.packingItems.filter((item) => item.id !== itemId),
    }));
  }

  function editImportantLink(link: ImportantLink) {
    setLinkForm({ ...link });
  }

  function saveImportantLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const link: ImportantLink = {
      id: linkForm.id ?? createId("link"),
      title: linkForm.title.trim(),
      url: linkForm.url.trim(),
      category: linkForm.category,
    };

    if (!link.title || !link.url) {
      return;
    }

    setData((current) => ({
      ...current,
      importantLinks: linkForm.id
        ? current.importantLinks.map((existing) => (existing.id === linkForm.id ? link : existing))
        : [...current.importantLinks, link],
    }));
    setLinkForm(blankImportantLink());
  }

  function deleteImportantLink(linkId: string) {
    setData((current) => ({
      ...current,
      importantLinks: current.importantLinks.filter((link) => link.id !== linkId),
    }));
  }

  return (
    <div className="trip-info-layout">
      <Panel title="Trip Basics">
        <div className="form-grid two-col">
          <Field label="Trip title">
            <input value={data.trip.title} onChange={(event) => updateTripField("title", event.target.value)} />
          </Field>
          <Field label="Lodging name">
            <input value={data.trip.lodging.name} onChange={(event) => updateLodgingField("name", event.target.value)} />
          </Field>
          <Field label="Address">
            <input value={data.trip.lodging.address} onChange={(event) => updateLodgingField("address", event.target.value)} />
          </Field>
          <div className="form-grid">
            <Field label="Check-in">
              <input value={data.trip.lodging.checkIn} onChange={(event) => updateLodgingField("checkIn", event.target.value)} />
            </Field>
            <Field label="Check-out">
              <input value={data.trip.lodging.checkOut} onChange={(event) => updateLodgingField("checkOut", event.target.value)} />
            </Field>
          </div>
        </div>
        <Field label="Parking notes">
          <textarea
            value={data.trip.lodging.parkingNotes}
            rows={3}
            onChange={(event) => updateLodgingField("parkingNotes", event.target.value)}
          />
        </Field>
        <div className="snapshot-list">
          <div>
            <MapPin size={17} aria-hidden="true" />
            <span>{data.trip.lodging.address}</span>
          </div>
        </div>
      </Panel>

      <div className="workspace-grid info-grid">
        <Panel title="Quick Notes" className="workspace-main">
          <form className="inline-form" onSubmit={addNote}>
            <input value={newNote} onChange={(event) => setNewNote(event.target.value)} placeholder="Add a family note" />
            <Button type="submit" variant="secondary">
              <Plus size={16} aria-hidden="true" />
              Add
            </Button>
          </form>
          {data.trip.notes.length > 0 ? (
            <div className="editable-list">
              {data.trip.notes.map((note) => (
                <div key={note.id} className="editable-row">
                  <input value={note.text} onChange={(event) => updateNote(note.id, event.target.value)} aria-label="Trip note" />
                  <IconButton label="Delete note" variant="danger" onClick={() => deleteNote(note.id)}>
                    <Trash2 size={16} aria-hidden="true" />
                  </IconButton>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No notes yet" description="Add parking reminders, grocery notes, or beach safety reminders." />
          )}
        </Panel>

        <aside className="workspace-side">
          <Panel title="Emergency & Photo Notes">
            <Field label="Emergency info">
              <textarea
                value={data.trip.emergencyInfo}
                rows={5}
                onChange={(event) => updateTripField("emergencyInfo", event.target.value)}
              />
            </Field>
            <Field label="Family photo outfit notes">
              <textarea
                value={data.trip.photoOutfitNotes}
                rows={5}
                onChange={(event) => updateTripField("photoOutfitNotes", event.target.value)}
              />
            </Field>
          </Panel>
        </aside>
      </div>

      <div className="workspace-grid info-grid">
        <Panel title={`Packing List (${packedCount}/${data.packingItems.length})`} className="workspace-main">
          <div className="filter-row">
            <button className={cx("filter-chip", packingFilter === "all" && "filter-chip-active")} onClick={() => setPackingFilter("all")}>
              All
            </button>
            {packingCategories.map((category) => (
              <button
                key={category}
                className={cx("filter-chip", packingFilter === category && "filter-chip-active")}
                onClick={() => setPackingFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {visiblePacking.length > 0 ? (
            <div className="packing-list">
              {visiblePacking.map((item) => (
                <div key={item.id} className={cx("packing-row", item.packed && "packing-row-packed")}>
                  <button className="check-button" onClick={() => togglePacked(item.id)} aria-label={`Toggle ${item.name}`}>
                    <CheckCircle2 size={18} aria-hidden="true" />
                  </button>
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.category}</span>
                  </div>
                  <div className="icon-row">
                    <IconButton label={`Edit ${item.name}`} onClick={() => editPackingItem(item)}>
                      <Edit3 size={16} aria-hidden="true" />
                    </IconButton>
                    <IconButton label={`Delete ${item.name}`} variant="danger" onClick={() => deletePackingItem(item.id)}>
                      <Trash2 size={16} aria-hidden="true" />
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No packing items here" description="Add the first item for this category." />
          )}
        </Panel>

        <aside className="workspace-side">
          <Panel title={packingForm.id ? "Edit packing item" : "Add packing item"}>
            <form className="stack-form" onSubmit={savePackingItem}>
              <Field label="Item">
                <input value={packingForm.name} onChange={(event) => setPackingForm((current) => ({ ...current, name: event.target.value }))} />
              </Field>
              <Field label="Category">
                <select
                  value={packingForm.category}
                  onChange={(event) => setPackingForm((current) => ({ ...current, category: event.target.value as PackingCategory }))}
                >
                  {packingCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </Field>
              <label className="checkbox-inline">
                <input
                  type="checkbox"
                  checked={packingForm.packed}
                  onChange={(event) => setPackingForm((current) => ({ ...current, packed: event.target.checked }))}
                />
                Packed
              </label>
              <div className="form-actions">
                <Button type="submit">
                  <ListPlus size={16} aria-hidden="true" />
                  {packingForm.id ? "Save item" : "Add item"}
                </Button>
                {packingForm.id ? (
                  <Button type="button" variant="ghost" onClick={() => setPackingForm(blankPackingItem())}>
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>
          </Panel>

          <Panel title="Beach Gear">
            <div className="mini-list">
              {beachGear.map((item) => (
                <span key={item.id} className={cx(item.packed && "is-done")}>
                  {item.name}
                </span>
              ))}
            </div>
          </Panel>
        </aside>
      </div>

      <div className="workspace-grid info-grid">
        <Panel title="Important Links" className="workspace-main">
          {data.importantLinks.length > 0 ? (
            <div className="link-list">
              {data.importantLinks.map((link) => (
                <div key={link.id} className="link-row">
                  <div>
                    <span>{link.category}</span>
                    <ExternalAnchor href={link.url}>{link.title}</ExternalAnchor>
                  </div>
                  <div className="icon-row">
                    <IconButton label={`Edit ${link.title}`} onClick={() => editImportantLink(link)}>
                      <Edit3 size={16} aria-hidden="true" />
                    </IconButton>
                    <IconButton label={`Delete ${link.title}`} variant="danger" onClick={() => deleteImportantLink(link.id)}>
                      <Trash2 size={16} aria-hidden="true" />
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No links yet" description="Add official beach, weather, lodging, or emergency links." />
          )}
        </Panel>

        <aside className="workspace-side">
          <Panel title={linkForm.id ? "Edit link" : "Add link"}>
            <form className="stack-form" onSubmit={saveImportantLink}>
              <Field label="Title">
                <input value={linkForm.title} onChange={(event) => setLinkForm((current) => ({ ...current, title: event.target.value }))} />
              </Field>
              <Field label="URL">
                <input value={linkForm.url} onChange={(event) => setLinkForm((current) => ({ ...current, url: event.target.value }))} />
              </Field>
              <Field label="Category">
                <select
                  value={linkForm.category}
                  onChange={(event) => setLinkForm((current) => ({ ...current, category: event.target.value as LinkCategory }))}
                >
                  {linkCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="form-actions">
                <Button type="submit">
                  <LinkIcon size={16} aria-hidden="true" />
                  {linkForm.id ? "Save link" : "Add link"}
                </Button>
                {linkForm.id ? (
                  <Button type="button" variant="ghost" onClick={() => setLinkForm(blankImportantLink())}>
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>
          </Panel>
        </aside>
      </div>
    </div>
  );
}

function blankPackingItem(): PackingFormState {
  return {
    name: "",
    category: "Beach gear",
    packed: false,
  };
}

function blankImportantLink(): LinkFormState {
  return {
    title: "",
    url: "https://",
    category: "Lodging",
  };
}
