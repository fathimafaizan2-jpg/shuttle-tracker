import { describe, expect, it, vi } from "vitest";

/*
  auth.ts imports Firebase Admin. This mock keeps the role-logic test local and
  independent from your real Firebase service-account file.
*/
vi.mock("./firebaseAdmin.js", () => ({
  adminAuth: {},
  db: {}
}));

import { requireFlightAccess, requireOwnMember, requireRole, type AuthenticatedMember } from "./auth.js";

const player: AuthenticatedMember = {
  uid: "player-101",
  email: "player@example.com",
  role: "PLAYER",
  fullName: "Player One",
  memberId: "ICB-101",
  flightId: "flight-1"
};

const flightAdmin: AuthenticatedMember = {
  uid: "admin-201",
  email: "admin@example.com",
  role: "LEVEL_ADMIN",
  fullName: "Flight Admin",
  memberId: "ICB-201",
  flightId: "flight-1"
};

const superAdmin: AuthenticatedMember = {
  uid: "super-001",
  email: "super@example.com",
  role: "SUPER_ADMIN",
  fullName: "Super Admin",
  memberId: "ICB-001"
};

function runRoleGuard(member: AuthenticatedMember | undefined, allowedRoles: AuthenticatedMember["role"][]) {
  let nextCalled = false;
  let statusCode = 0;
  let body: unknown;
  const request = { member } as never;
  const response = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(value: unknown) {
      body = value;
      return this;
    }
  } as never;

  requireRole(...allowedRoles)(request, response, () => { nextCalled = true; });
  return { nextCalled, statusCode, body };
}

describe("Indian Club role protection", () => {
  it("allows a Player to access Player-only operations", () => {
    const result = runRoleGuard(player, ["PLAYER", "LEVEL_ADMIN", "SUPER_ADMIN"]);
    expect(result.nextCalled).toBe(true);
    expect(result.statusCode).toBe(0);
  });

  it("denies a Player access to Flight Admin operations", () => {
    const result = runRoleGuard(player, ["LEVEL_ADMIN", "SUPER_ADMIN"]);
    expect(result.nextCalled).toBe(false);
    expect(result.statusCode).toBe(403);
    expect(result.body).toEqual({ message: "You do not have permission for this action." });
  });

  it("allows the assigned Flight Admin to access their own flight", () => {
    expect(requireFlightAccess("flight-1", flightAdmin)).toBe(true);
  });

  it("denies a Flight Admin access to another flight", () => {
    expect(requireFlightAccess("flight-2", flightAdmin)).toBe(false);
  });

  it("allows Super Admin to access every flight", () => {
    expect(requireFlightAccess("flight-1", superAdmin)).toBe(true);
    expect(requireFlightAccess("flight-999", superAdmin)).toBe(true);
  });

  it("allows a Player to access only their own member record", () => {
    expect(requireOwnMember("player-101", player)).toBe(true);
    expect(requireOwnMember("player-999", player)).toBe(false);
  });

  it("allows Super Admin to access any member record", () => {
    expect(requireOwnMember("player-999", superAdmin)).toBe(true);
  });

  it("returns 401 if no authenticated member is available", () => {
    const result = runRoleGuard(undefined, ["SUPER_ADMIN"]);
    expect(result.nextCalled).toBe(false);
    expect(result.statusCode).toBe(401);
    expect(result.body).toEqual({ message: "Sign in required." });
  });
});
