"use client";

import { useState } from "react";
import {
  CalendarDays,
  Camera,
  Home,
  Info,
  Lightbulb,
  RotateCcw,
  Utensils,
  Waves,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Dashboard } from "./Dashboard";
import { PhotoShare } from "./PhotoShare";
import { RestaurantBoard } from "./RestaurantBoard";
import { SchedulePlanner } from "./SchedulePlanner";
import { SuggestionsBoard } from "./SuggestionsBoard";
import { TripInfo } from "./TripInfo";
import { Button, cx } from "./ui";
import { getCurrentTripDay } from "@/lib/date";
import { useTripData } from "@/lib/storage";

type TabId = "dashboard" | "schedule" | "photos" | "restaurants" | "suggestions" | "info";

const tabs: Array<{ id: TabId; label: string; icon: LucideIcon }> = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "schedule", label: "Schedule", icon: CalendarDays },
  { id: "photos", label: "Photos", icon: Camera },
  { id: "restaurants", label: "Restaurants", icon: Utensils },
  { id: "suggestions", label: "Suggestions", icon: Lightbulb },
  { id: "info", label: "Trip Info", icon: Info },
];

export function FamilyHubApp() {
  const { data, setData, hydrated, resetData } = useTripData();
  const today = getCurrentTripDay(data.trip.startDate, data.trip.endDate);
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  const activeTabLabel = tabs.find((tab) => tab.id === activeTab)?.label ?? "Dashboard";

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark" aria-hidden="true">
            <Waves size={25} />
          </div>
          <div>
            <h1>{data.trip.title}</h1>
            <p>
              {data.trip.lodging.name} | {activeTabLabel}
            </p>
          </div>
        </div>

        <nav className="desktop-nav" aria-label="Main sections">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={cx("nav-tab", activeTab === tab.id && "nav-tab-active")}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={17} aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <Button variant="secondary" onClick={resetData} title="Reset local sample data">
          <RotateCcw size={16} aria-hidden="true" />
          Reset
        </Button>
      </header>

      <main className={cx("app-main", !hydrated && "is-loading")}>
        {activeTab === "dashboard" ? (
          <Dashboard data={data} today={today} onNavigate={setActiveTab} />
        ) : null}
        {activeTab === "schedule" ? <SchedulePlanner data={data} setData={setData} today={today} /> : null}
        {activeTab === "photos" ? <PhotoShare data={data} setData={setData} today={today} /> : null}
        {activeTab === "restaurants" ? <RestaurantBoard data={data} setData={setData} /> : null}
        {activeTab === "suggestions" ? <SuggestionsBoard data={data} setData={setData} today={today} /> : null}
        {activeTab === "info" ? <TripInfo data={data} setData={setData} /> : null}
      </main>

      <nav className="mobile-nav" aria-label="Main sections">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={cx("mobile-nav-tab", activeTab === tab.id && "mobile-nav-tab-active")}
              onClick={() => setActiveTab(tab.id)}
              aria-label={tab.label}
              title={tab.label}
            >
              <Icon size={20} aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
