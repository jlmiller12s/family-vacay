import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { generateSuggestedDay } from "./suggestDay";

const baseInput = {
  day: "2026-06-12",
  familyMemberIds: ["m-dana", "m-kids"],
  familyPhotoTime: "18:45",
  rainyBackup: false,
} as const;

describe("generateSuggestedDay", () => {
  it("builds a beach-first rhythm with cool-down and dinner", () => {
    const schedule = generateSuggestedDay({
      ...baseInput,
      beachFirst: true,
      mealPreference: "seafood",
      restaurantName: "LuLu's Gulf Shores",
    });

    assert.equal(schedule[0].time, "08:15");
    assert.equal(schedule[0].type, "beach");
    assert.equal(schedule.some((item) => item.title.includes("Lunch")), true);
    assert.match(schedule.at(-1)?.title ?? "", /LuLu's Gulf Shores/);
  });

  it("includes family photos when a booking time is supplied", () => {
    const schedule = generateSuggestedDay({
      ...baseInput,
      beachFirst: true,
      mealPreference: "nice-dinner",
      restaurantName: "Nice dinner idea",
    });

    assert.equal(schedule.some((item) => item.time === "18:45" && item.type === "photo"), true);
  });

  it("switches the afternoon block to a backup option for rainy or rough-water days", () => {
    const schedule = generateSuggestedDay({
      ...baseInput,
      beachFirst: false,
      mealPreference: "kid-first",
      restaurantName: undefined,
      rainyBackup: true,
    });

    assert.equal(
      schedule.some((item) => item.type === "backup" && item.title === "Rainy day / rough water backup"),
      true,
    );
  });
});
