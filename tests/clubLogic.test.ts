import { describe, expect, it } from "vitest";
import { ATTENDANCE_LOCK_DELAY_MS, calculateShuttleSessionCost, isAttendanceLocked, isPaymentArrears, repeatingWeeklyDatesForMonth } from "../server/clubLogic.js";

describe("Indian Club shuttle rules", () => {
  it("calculates one-shuttle price, day cost, attendee-only charges, and remaining shuttles", () => {
    const result = calculateShuttleSessionCost({
      tubePriceFils: 6000,
      shuttlesPerTube: 12,
      availableTubeCount: 1,
      looseShuttlesBeforeGame: 0,
      shuttlesUsedAfterGame: 7,
      actualAttendeeCount: 10
    });
    expect(result.totalDayCostFils).toBe(3500);
    expect(result.remainingShuttles).toBe(5);
    expect(result.attendeeChargesFils).toEqual([350,350,350,350,350,350,350,350,350,350]);
  });

  it("uses all actual attendees and shares unavoidable fils fairly", () => {
    const result = calculateShuttleSessionCost({ tubePriceFils: 6500, shuttlesPerTube: 15, availableTubeCount: 1, looseShuttlesBeforeGame: 0, shuttlesUsedAfterGame: 7, actualAttendeeCount: 3 });
    expect(result.attendeeChargesFils.reduce((a,b)=>a+b,0)).toBe(result.totalDayCostFils);
    expect(Math.max(...result.attendeeChargesFils)-Math.min(...result.attendeeChargesFils)).toBeLessThanOrEqual(1);
  });

  it("locks attendance exactly 15 minutes after session start", () => {
    const start = 1_000_000;
    expect(isAttendanceLocked(start, start + ATTENDANCE_LOCK_DELAY_MS - 1)).toBe(false);
    expect(isAttendanceLocked(start, start + ATTENDANCE_LOCK_DELAY_MS)).toBe(true);
  });

  it("marks pending payment as arrears after one day", () => {
    const created = 1_000_000;
    expect(isPaymentArrears(created, "PENDING", created + 86_400_000 - 1)).toBe(false);
    expect(isPaymentArrears(created, "PENDING", created + 86_400_000)).toBe(true);
  });

  it("returns all recurring Saturdays in a month", () => {
    const dates = repeatingWeeklyDatesForMonth(2026, 6, 6);
    expect(dates.length).toBeGreaterThan(4);
  });
});
