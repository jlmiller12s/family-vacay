"use client";

import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import { useMemo, useState } from "react";
import { Camera, ChevronLeft, ChevronRight, Heart, Trash2, Upload, X } from "lucide-react";
import { formatDayLabel, getTripDays } from "@/lib/date";
import { createId } from "@/lib/id";
import type { Photo, TripData } from "@/lib/types";
import { EmptyState, Field, IconButton, Panel, cx } from "./ui";

type PhotoShareProps = {
  data: TripData;
  setData: Dispatch<SetStateAction<TripData>>;
  today: string;
};

export function PhotoShare({ data, setData, today }: PhotoShareProps) {
  const days = useMemo(() => getTripDays(data.trip.startDate, data.trip.endDate), [data.trip.startDate, data.trip.endDate]);
  const [selectedDay, setSelectedDay] = useState<string | "all">(today);
  const [caption, setCaption] = useState("");
  const [uploadedBy, setUploadedBy] = useState(data.familyMembers[0]?.name ?? "Family");
  const [uploadDay, setUploadDay] = useState(today);
  const [lightboxId, setLightboxId] = useState<string | null>(null);

  const visiblePhotos = data.photos
    .filter((photo) => selectedDay === "all" || photo.day === selectedDay)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const lightboxIndex = visiblePhotos.findIndex((photo) => photo.id === lightboxId);
  const lightboxPhoto = lightboxIndex >= 0 ? visiblePhotos[lightboxIndex] : null;

  async function uploadPhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    const photos: Photo[] = await Promise.all(
      files.map(async (file) => ({
        id: createId("photo"),
        image: await readFileAsDataUrl(file),
        day: uploadDay,
        caption: caption.trim() || cleanFileName(file.name),
        uploadedBy: uploadedBy.trim() || "Family",
        favorites: [],
        createdAt: new Date().toISOString(),
      })),
    );

    setData((current) => ({
      ...current,
      photos: [...photos, ...current.photos],
    }));
    setCaption("");
    event.target.value = "";
  }

  function toggleFavorite(photoId: string) {
    setData((current) => ({
      ...current,
      photos: current.photos.map((photo) =>
        photo.id === photoId
          ? {
              ...photo,
              favorites: photo.favorites.includes("family") ? photo.favorites.filter((id) => id !== "family") : ["family"],
            }
          : photo,
      ),
    }));
  }

  function deletePhoto(photoId: string) {
    setData((current) => ({
      ...current,
      photos: current.photos.filter((photo) => photo.id !== photoId),
    }));
    if (lightboxId === photoId) {
      setLightboxId(null);
    }
  }

  function moveLightbox(direction: -1 | 1) {
    if (visiblePhotos.length === 0 || lightboxIndex < 0) {
      return;
    }
    const nextIndex = (lightboxIndex + direction + visiblePhotos.length) % visiblePhotos.length;
    setLightboxId(visiblePhotos[nextIndex].id);
  }

  return (
    <div className="workspace-grid photo-workspace">
      <Panel title="Family Photos" className="workspace-main">
        <div className="section-row">
          <p className="muted">
            Uploads stay private in this browser for the prototype. Favorites power the dashboard highlights.
          </p>
          <div className="filter-row compact-filter">
            <button className={cx("filter-chip", selectedDay === "all" && "filter-chip-active")} onClick={() => setSelectedDay("all")}>
              All days
            </button>
            {days.map((day) => (
              <button
                key={day}
                className={cx("filter-chip", selectedDay === day && "filter-chip-active")}
                onClick={() => setSelectedDay(day)}
              >
                {formatDayLabel(day)}
              </button>
            ))}
          </div>
        </div>

        {visiblePhotos.length > 0 ? (
          <div className="photo-grid">
            {visiblePhotos.map((photo) => (
              <figure key={photo.id} className="photo-tile">
                <button className="photo-open" onClick={() => setLightboxId(photo.id)} aria-label={`Open ${photo.caption}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.image} alt={photo.caption} />
                </button>
                <figcaption>
                  <div>
                    <strong>{photo.caption}</strong>
                    <span>{formatDayLabel(photo.day)} | {photo.uploadedBy}</span>
                  </div>
                  <div className="icon-row">
                    <IconButton
                      label={photo.favorites.includes("family") ? `Unfavorite ${photo.caption}` : `Favorite ${photo.caption}`}
                      variant={photo.favorites.includes("family") ? "secondary" : "ghost"}
                      onClick={() => toggleFavorite(photo.id)}
                    >
                      <Heart size={16} aria-hidden="true" fill={photo.favorites.includes("family") ? "currentColor" : "none"} />
                    </IconButton>
                    <IconButton label={`Delete ${photo.caption}`} variant="danger" onClick={() => deletePhoto(photo.id)}>
                      <Trash2 size={16} aria-hidden="true" />
                    </IconButton>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No photos here yet"
            description="Upload a beach morning, dinner snapshot, or family-photo favorite."
            action={
              <label className="button button-secondary file-button">
                <Camera size={16} aria-hidden="true" />
                Choose photos
                <input type="file" accept="image/*" multiple onChange={uploadPhotos} />
              </label>
            }
          />
        )}
      </Panel>

      <aside className="workspace-side">
        <Panel title="Upload Photos">
          <div className="stack-form">
            <Field label="Day">
              <select value={uploadDay} onChange={(event) => setUploadDay(event.target.value)}>
                {days.map((day) => (
                  <option key={day} value={day}>
                    {formatDayLabel(day)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Uploaded by">
              <input value={uploadedBy} onChange={(event) => setUploadedBy(event.target.value)} />
            </Field>
            <Field label="Caption">
              <input value={caption} onChange={(event) => setCaption(event.target.value)} placeholder="Optional caption" />
            </Field>
            <label className="button button-primary file-button">
              <Upload size={16} aria-hidden="true" />
              Upload photos
              <input type="file" accept="image/*" multiple onChange={uploadPhotos} />
            </label>
          </div>
        </Panel>
      </aside>

      {lightboxPhoto ? (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={lightboxPhoto.caption}>
          <div className="lightbox-panel">
            <div className="lightbox-toolbar">
              <div>
                <strong>{lightboxPhoto.caption}</strong>
                <span>{formatDayLabel(lightboxPhoto.day)} | {lightboxPhoto.uploadedBy}</span>
              </div>
              <IconButton label="Close photo" onClick={() => setLightboxId(null)}>
                <X size={18} aria-hidden="true" />
              </IconButton>
            </div>
            <div className="lightbox-image-wrap">
              <IconButton label="Previous photo" onClick={() => moveLightbox(-1)}>
                <ChevronLeft size={22} aria-hidden="true" />
              </IconButton>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={lightboxPhoto.image} alt={lightboxPhoto.caption} />
              <IconButton label="Next photo" onClick={() => moveLightbox(1)}>
                <ChevronRight size={22} aria-hidden="true" />
              </IconButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function cleanFileName(name: string) {
  return name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
}
