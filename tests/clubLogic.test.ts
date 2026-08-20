import { describe, expect, it } from "vitest";
import { LOCK_DELAY_MS, costPerActualAttendeeFils, isArrears, isSessionLocked } from "../server/clubLogic.js";

describe("Indian Club business rules", () => {
  it("splits tube cost among actual attendees", () => {
    expect(costPerActualAttendeeFils(6500, 1, 10)).toEqual({ totalSessionCostFils: 6500, costPerPersonFils: 650 });
  });

  it("rounds fractional fils up so the club never loses a fil", () => {
    expect(costPerActualAttendeeFils(5001, 1, 10).costPerPersonFils).toBe(501);
  });

  it("locks a session exactly 15 minutes after scheduled start", () => {
    const start = 100000;
    expect(isSessionLocked(start, start + LOCK_DELAY_MS - 1)).toBe(false);
    expect(isSessionLocked(start, start + LOCK_DELAY_MS)).toBe(true);
  });

  it("marks pending payment as arrears after one day", () => {
    const created = 100000;
    expect(isArrears(created, "PENDING", created + 86400000 - 1)).toBe(false);
    expect(isArrears(created, "PENDING", created + 86400000)).toBe(true);
    expect(isArrears(created, "VERIFIED", created + 999999999)).toBe(false);
  });
});
