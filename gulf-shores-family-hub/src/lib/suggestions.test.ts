import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { recommendSuggestions } from "./suggestions";

describe("recommendSuggestions", () => {
  it("ranks highly voted family-friendly ideas above low-detail ideas", () => {
    const recommendations = recommendSuggestions([
      {
        id: "low-detail",
        title: "Maybe something",
        kind: "activity",
        category: "other",
        day: "2026-06-12",
        location: "",
        notes: "",
        suggestedBy: "Dana",
        votes: [],
        link: "",
        createdAt: "2026-06-01T12:00:00.000Z",
      },
      {
        id: "family-backup",
        title: "Indoor mini golf",
        kind: "activity",
        category: "rainy day",
        day: "2026-06-12",
        location: "Gulf Shores",
        notes: "Kid-friendly backup if surf is rough or storms roll in.",
        suggestedBy: "Mike",
        votes: ["m-dana", "m-mike", "m-kids"],
        link: "https://www.gulfshores.com/things-to-do/attractions/",
        createdAt: "2026-06-01T12:10:00.000Z",
      },
    ]);

    assert.equal(recommendations[0].suggestionId, "family-backup");
    assert.equal(recommendations[0].verdict, "Great fit");
    assert.equal(recommendations.at(-1)?.verdict, "Needs details");
  });

  it("flags expensive or long-drive suggestions for discussion even with votes", () => {
    const [recommendation] = recommendSuggestions([
      {
        id: "far-dinner",
        title: "Fancy dinner far away",
        kind: "restaurant",
        category: "nice dinner",
        day: "2026-06-12",
        location: "Long drive",
        notes: "Looks expensive and far away for kids after a beach day.",
        suggestedBy: "Nana",
        votes: ["m-dana", "m-nana"],
        link: "",
        createdAt: "2026-06-01T12:00:00.000Z",
      },
    ]);

    assert.equal(recommendation.verdict, "Discuss first");
    assert.match(recommendation.rationale, /drive|expensive/i);
  });
});
