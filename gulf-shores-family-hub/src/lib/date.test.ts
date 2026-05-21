import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatTimeLabel } from "./date";

describe("formatTimeLabel", () => {
  it("formats 24-hour stored times as 12-hour labels", () => {
    assert.equal(formatTimeLabel("00:00"), "12:00 AM");
    assert.equal(formatTimeLabel("08:05"), "8:05 AM");
    assert.equal(formatTimeLabel("12:00"), "12:00 PM");
    assert.equal(formatTimeLabel("15:30"), "3:30 PM");
    assert.equal(formatTimeLabel("18:45"), "6:45 PM");
  });
});
