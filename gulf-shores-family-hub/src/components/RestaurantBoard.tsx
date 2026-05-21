"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";
import { useMemo, useState } from "react";
import { Edit3, Plus, Star, Trash2, Utensils } from "lucide-react";
import { createId } from "@/lib/id";
import type { Restaurant, RestaurantCategory, TripData } from "@/lib/types";
import { Button, EmptyState, ExternalAnchor, Field, IconButton, Panel, cx } from "./ui";

type RestaurantBoardProps = {
  data: TripData;
  setData: Dispatch<SetStateAction<TripData>>;
};

type RestaurantFormState = Omit<Restaurant, "id"> & {
  id?: string;
};

const categories: RestaurantCategory[] = [
  "kid-friendly",
  "seafood",
  "casual",
  "nice dinner",
  "near the beach",
  "needs reservation",
];

export function RestaurantBoard({ data, setData }: RestaurantBoardProps) {
  const [activeCategory, setActiveCategory] = useState<RestaurantCategory | "all">("all");
  const [form, setForm] = useState<RestaurantFormState>(blankRestaurant());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const officialRestaurantsLink = data.importantLinks.find((link) => link.category === "Restaurants");

  const visibleRestaurants = useMemo(() => {
    return data.restaurants
      .filter((restaurant) => activeCategory === "all" || restaurant.category.includes(activeCategory))
      .sort((a, b) => Number(b.favorite) - Number(a.favorite) || b.familyRating - a.familyRating || a.name.localeCompare(b.name));
  }, [activeCategory, data.restaurants]);

  function openCreateForm() {
    setForm(blankRestaurant());
    setIsFormOpen(true);
  }

  function openEditForm(restaurant: Restaurant) {
    setForm({ ...restaurant });
    setIsFormOpen(true);
  }

  function saveRestaurant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const restaurant: Restaurant = {
      id: form.id ?? createId("restaurant"),
      name: form.name.trim(),
      category: form.category.length > 0 ? form.category : ["casual"],
      notes: form.notes.trim(),
      priceLevel: form.priceLevel,
      familyRating: Number(form.familyRating),
      reservationStatus: form.reservationStatus,
      link: form.link.trim() || "https://www.gulfshores.com/restaurants/",
      favorite: form.favorite,
    };

    if (!restaurant.name) {
      return;
    }

    setData((current) => ({
      ...current,
      restaurants: form.id
        ? current.restaurants.map((existing) => (existing.id === form.id ? restaurant : existing))
        : [...current.restaurants, restaurant],
    }));
    setForm(blankRestaurant());
    setIsFormOpen(false);
  }

  function deleteRestaurant(restaurantId: string) {
    setData((current) => ({
      ...current,
      restaurants: current.restaurants.filter((restaurant) => restaurant.id !== restaurantId),
    }));
  }

  function toggleFavorite(restaurantId: string) {
    setData((current) => ({
      ...current,
      restaurants: current.restaurants.map((restaurant) =>
        restaurant.id === restaurantId ? { ...restaurant, favorite: !restaurant.favorite } : restaurant,
      ),
    }));
  }

  function toggleCategory(category: RestaurantCategory) {
    setForm((current) => ({
      ...current,
      category: current.category.includes(category)
        ? current.category.filter((existing) => existing !== category)
        : [...current.category, category],
    }));
  }

  return (
    <div className="workspace-grid restaurant-workspace">
      <Panel
        title="Restaurant Board"
        className="workspace-main"
        action={
          <Button onClick={openCreateForm}>
            <Plus size={16} aria-hidden="true" />
            Add restaurant
          </Button>
        }
      >
        <div className="section-row">
          <p className="muted">
            Editable ideas only. Use official/current restaurant pages for hours, menus, closures, and reservation details.
          </p>
          {officialRestaurantsLink ? <ExternalAnchor href={officialRestaurantsLink.url}>Official guide</ExternalAnchor> : null}
        </div>

        <div className="filter-row" aria-label="Restaurant categories">
          <button className={cx("filter-chip", activeCategory === "all" && "filter-chip-active")} onClick={() => setActiveCategory("all")}>
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              className={cx("filter-chip", activeCategory === category && "filter-chip-active")}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {visibleRestaurants.length > 0 ? (
          <div className="restaurant-grid">
            {visibleRestaurants.map((restaurant) => (
              <article key={restaurant.id} className="restaurant-card">
                <div className="restaurant-header">
                  <div>
                    <h3>{restaurant.name}</h3>
                    <p>{restaurant.priceLevel} | {reservationLabel(restaurant.reservationStatus)}</p>
                  </div>
                  <IconButton
                    label={restaurant.favorite ? `Unfavorite ${restaurant.name}` : `Favorite ${restaurant.name}`}
                    variant={restaurant.favorite ? "secondary" : "ghost"}
                    onClick={() => toggleFavorite(restaurant.id)}
                  >
                    <Star size={17} aria-hidden="true" fill={restaurant.favorite ? "currentColor" : "none"} />
                  </IconButton>
                </div>
                <p>{restaurant.notes}</p>
                <div className="category-row">
                  {restaurant.category.map((category) => (
                    <span key={category}>{category}</span>
                  ))}
                </div>
                <div className="rating-row" aria-label={`${restaurant.familyRating} out of 5 family rating`}>
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star
                      key={index}
                      size={15}
                      aria-hidden="true"
                      fill={index < restaurant.familyRating ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <div className="item-footer">
                  <ExternalAnchor href={restaurant.link}>Reference</ExternalAnchor>
                  <div className="icon-row">
                    <IconButton label={`Edit ${restaurant.name}`} onClick={() => openEditForm(restaurant)}>
                      <Edit3 size={16} aria-hidden="true" />
                    </IconButton>
                    <IconButton label={`Delete ${restaurant.name}`} variant="danger" onClick={() => deleteRestaurant(restaurant.id)}>
                      <Trash2 size={16} aria-hidden="true" />
                    </IconButton>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No restaurants in this category"
            description="Add a restaurant idea or switch filters to see the editable sample board."
            action={
              <Button variant="secondary" onClick={openCreateForm}>
                <Utensils size={16} aria-hidden="true" />
                Add idea
              </Button>
            }
          />
        )}
      </Panel>

      <aside className="workspace-side">
        {isFormOpen ? (
          <Panel title={form.id ? "Edit restaurant" : "New restaurant"}>
            <form className="stack-form" onSubmit={saveRestaurant}>
              <Field label="Name">
                <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
              </Field>
              <Field label="Notes">
                <textarea value={form.notes} rows={4} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
              </Field>
              <div className="form-grid">
                <Field label="Price">
                  <select
                    value={form.priceLevel}
                    onChange={(event) => setForm((current) => ({ ...current, priceLevel: event.target.value as Restaurant["priceLevel"] }))}
                  >
                    <option value="$">$</option>
                    <option value="$$">$$</option>
                    <option value="$$$">$$$</option>
                    <option value="$$$$">$$$$</option>
                  </select>
                </Field>
                <Field label="Rating">
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={form.familyRating}
                    onChange={(event) => setForm((current) => ({ ...current, familyRating: Number(event.target.value) }))}
                  />
                </Field>
              </div>
              <Field label="Reservation status">
                <select
                  value={form.reservationStatus}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      reservationStatus: event.target.value as Restaurant["reservationStatus"],
                    }))
                  }
                >
                  <option value="none">No reservation</option>
                  <option value="considering">Considering</option>
                  <option value="needed">Needs reservation</option>
                  <option value="booked">Booked</option>
                </select>
              </Field>
              <Field label="Reference link">
                <input value={form.link} onChange={(event) => setForm((current) => ({ ...current, link: event.target.value }))} />
              </Field>
              <div className="checkbox-stack">
                <span className="field-label">Categories</span>
                {categories.map((category) => (
                  <label key={category}>
                    <input type="checkbox" checked={form.category.includes(category)} onChange={() => toggleCategory(category)} />
                    {category}
                  </label>
                ))}
                <label>
                  <input
                    type="checkbox"
                    checked={form.favorite}
                    onChange={(event) => setForm((current) => ({ ...current, favorite: event.target.checked }))}
                  />
                  Family favorite
                </label>
              </div>
              <div className="form-actions">
                <Button type="submit">{form.id ? "Save restaurant" : "Create restaurant"}</Button>
                <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Panel>
        ) : (
          <Panel title="Board Tips">
            <p className="muted">
              Keep the board private and editable. Add your own notes, then use official tourism pages or restaurant sites for current hours and booking.
            </p>
          </Panel>
        )}
      </aside>
    </div>
  );
}

function blankRestaurant(): RestaurantFormState {
  return {
    name: "",
    category: ["casual", "kid-friendly"],
    notes: "",
    priceLevel: "$$",
    familyRating: 4,
    reservationStatus: "considering",
    link: "https://www.gulfshores.com/restaurants/",
    favorite: false,
  };
}

function reservationLabel(status: Restaurant["reservationStatus"]) {
  const labels: Record<Restaurant["reservationStatus"], string> = {
    none: "walk-up idea",
    considering: "watching",
    needed: "needs reservation",
    booked: "booked",
  };

  return labels[status];
}
