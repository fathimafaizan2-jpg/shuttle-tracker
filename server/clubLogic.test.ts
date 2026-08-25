import { describe, expect, it } from "vitest";
import {
  ARREARS_AFTER_HOURS,
  ATTENDANCE_LOCK_AFTER_MINUTES,
  calculateShuttleCost,
  isSessionLocked,
  splitFilsEqually
} from "./clubLogic.js";

describe("Indian Club shuttlecock cost formula", () => {
  it("calculates available shuttlecocks and remaining stock", () => {
    const result = calculateShuttleCost(
      {
        availableTubes: 4,
        looseShuttles: 3,
        shuttlesPerTube: 12,
        tubePriceFils: 3000
      },
      15,
      ["member-b", "member-a", "member-c"]
    );

    expect(result.totalAvailableShuttles).toBe(51);
    expect(result.actualShuttlesUsed).toBe(15);
    expect(result.remainingShuttles).toBe(36);
  });

  it("calculates total day cost from actual shuttlecocks used only", () => {
    const result = calculateShuttleCost(
      {
        availableTubes: 2,
        looseShuttles: 0,
        shuttlesPerTube: 12,
        tubePriceFils: 3000
      },
      5,
      ["member-a", "member-b"]
    );

    /* 5 × 3,000 / 12 = 1,250 fils = BHD 1.250 */
    expect(result.totalDayCostFils).toBe(1250);
    expect(result.attendeeCount).toBe(2);
    expect(result.charges).toEqual([
      { memberUid: "member-a", amountFils: 625 },
      { memberUid: "member-b", amountFils: 625 }
    ]);
  });

  it("uses the club example: BHD 12 tube, 12 shuttlecocks, 9 used, 5 PRESENT", () => {
    const result = calculateShuttleCost(
      {
        availableTubes: 2,
        looseShuttles: 0,
        shuttlesPerTube: 12,
        tubePriceFils: 12000
      },
      9,
      ["member-a", "member-b", "member-c", "member-d", "member-e"]
    );

    /* BHD 12.000 ÷ 12 = BHD 1.000 per shuttlecock; 9 ÷ 5 = BHD 1.800 per Player. */
    expect(result.costPerShuttleExactFils).toBe(1000);
    expect(result.totalDayCostFils).toBe(9000);
    expect(result.attendeeCount).toBe(5);
    expect(result.charges).toEqual([
      { memberUid: "member-a", amountFils: 1800 },
      { memberUid: "member-b", amountFils: 1800 },
      { memberUid: "member-c", amountFils: 1800 },
      { memberUid: "member-d", amountFils: 1800 },
      { memberUid: "member-e", amountFils: 1800 }
    ]);
  });

  it("charges final PRESENT attendees only and ignores duplicate IDs", () => {
    const result = calculateShuttleCost(
      {
        availableTubes: 1,
        looseShuttles: 0,
        shuttlesPerTube: 15,
        tubePriceFils: 4500
      },
      4,
      ["player-1", "player-1", "player-2"]
    );

    /* 4 × 4,500 / 15 = 1,200 fils; two final PRESENT attendees pay 600 each. */
    expect(result.attendeeCount).toBe(2);
    expect(result.totalDayCostFils).toBe(1200);
    expect(result.charges).toEqual([
      { memberUid: "player-1", amountFils: 600 },
      { memberUid: "player-2", amountFils: 600 }
    ]);
  });

  it("distributes remainder fils deterministically in alphabetical member UID order", () => {
    const charges = splitFilsEqually(1000, ["member-c", "member-a", "member-b"]);

    expect(charges).toEqual([
      { memberUid: "member-a", amountFils: 334 },
      { memberUid: "member-b", amountFils: 333 },
      { memberUid: "member-c", amountFils: 333 }
    ]);
    expect(charges.reduce((sum, charge) => sum + charge.amountFils, 0)).toBe(1000);
  });

  it("rejects usage greater than available stock", () => {
    expect(() => calculateShuttleCost(
      { availableTubes: 1, looseShuttles: 0, shuttlesPerTube: 12, tubePriceFils: 3000 },
      13,
      ["member-a"]
    )).toThrow("Actual shuttles used cannot be more than available stock.");
  });

  it("requires a final PRESENT attendee if any shuttlecock was used", () => {
    expect(() => calculateShuttleCost(
      { availableTubes: 1, looseShuttles: 0, shuttlesPerTube: 12, tubePriceFils: 3000 },
      1,
      []
    )).toThrow("At least one final PRESENT attendee is required");
  });
});

describe("Attendance lock rule", () => {
  it("locks attendance exactly 15 minutes before the scheduled start", () => {
    const startAt = new Date("2026-08-22T17:00:00.000Z");
    const beforeLock = new Date(startAt.getTime() - (ATTENDANCE_LOCK_AFTER_MINUTES * 60 * 1000) - 1);
    const atLock = new Date(startAt.getTime() - ATTENDANCE_LOCK_AFTER_MINUTES * 60 * 1000);

    expect(isSessionLocked(startAt, beforeLock)).toBe(false);
    expect(isSessionLocked(startAt, atLock)).toBe(true);
  });

  it("keeps arrears rule at 24 hours after session end", () => {
    expect(ARREARS_AFTER_HOURS).toBe(24);
  });
});
