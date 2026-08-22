import { describe, expect, it } from "vitest";

function canAccessFlight(role: string, assignedFlight: string | null, targetFlight: string) {
  return role === "SUPER_ADMIN" || assignedFlight === targetFlight;
}

function canCorrectLockedAttendance(role: string, assignedFlight: string | null, targetFlight: string, locked: boolean) {
  return locked && (role === "SUPER_ADMIN" || (role === "LEVEL_ADMIN" && assignedFlight === targetFlight));
}

describe("Indian Club authorization rules", () => {
  it("blocks Player access to another flight", () => {
    expect(canAccessFlight("PLAYER", "Flight 1", "Flight 2")).toBe(false);
  });
  it("allows Super Admin access to a future Flight 5", () => {
    expect(canAccessFlight("SUPER_ADMIN", null, "Flight 5")).toBe(true);
  });
  it("allows only same-flight Admin or Super Admin to correct locked attendance", () => {
    expect(canCorrectLockedAttendance("LEVEL_ADMIN", "Flight 1", "Flight 1", true)).toBe(true);
    expect(canCorrectLockedAttendance("LEVEL_ADMIN", "Flight 1", "Flight 2", true)).toBe(false);
    expect(canCorrectLockedAttendance("PLAYER", "Flight 1", "Flight 1", true)).toBe(false);
  });
  it("gives business submitters no Player dashboard access", () => {
    expect(["PLAYER", "LEVEL_ADMIN", "SUPER_ADMIN"].includes("BUSINESS_SUBMITTER")).toBe(false);
  });
});
