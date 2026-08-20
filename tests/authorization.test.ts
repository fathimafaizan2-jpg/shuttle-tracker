import { describe, expect, it } from "vitest";

function canReadFlight(role: string, assignedFlight: string | null, requestedFlight: string) {
  return role === "SUPER_ADMIN" || assignedFlight === requestedFlight;
}

function canUseBusinessDashboard(role: string) {
  return role === "SUPER_ADMIN" || role === "LEVEL_ADMIN" || role === "PLAYER";
}

describe("Indian Club role isolation", () => {
  it("does not allow a Player to read another flight", () => {
    expect(canReadFlight("PLAYER", "Flight 1", "Flight 2")).toBe(false);
  });

  it("allows Super Admin to read every flight", () => {
    expect(canReadFlight("SUPER_ADMIN", null, "Flight 5")).toBe(true);
  });

  it("does not give business submitters a player dashboard", () => {
    expect(canUseBusinessDashboard("BUSINESS_SUBMITTER")).toBe(false);
  });
});
