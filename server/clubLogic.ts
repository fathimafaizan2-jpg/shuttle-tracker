export const FILS_PER_BHD = 1000;
export const ATTENDANCE_LOCK_AFTER_MINUTES = 15;
export const ARREARS_AFTER_HOURS = 24;

export type AttendanceStatus = "PRESENT" | "ABSENT" | "NO_RESPONSE";

export type StockBeforeGame = {
  availableTubes: number;
  looseShuttles: number;
  shuttlesPerTube: number;
  tubePriceFils: number;
};

export type PlayerCharge = {
  memberUid: string;
  amountFils: number;
};

export type ShuttleCostResult = {
  totalAvailableShuttles: number;
  actualShuttlesUsed: number;
  remainingShuttles: number;
  costPerShuttleExactFils: number;
  totalDayCostFils: number;
  attendeeCount: number;
  charges: PlayerCharge[];
};

export function ceilDivide(numerator: number, denominator: number): number {
  if (!Number.isInteger(numerator) || !Number.isInteger(denominator) || denominator <= 0) {
    throw new Error("Invalid calculation values.");
  }
  return Math.ceil(numerator / denominator);
}

export function toFils(bhd: number): number {
  if (!Number.isFinite(bhd) || bhd < 0) throw new Error("BHD amount must be zero or greater.");
  return Math.round(bhd * FILS_PER_BHD);
}

export function toBhd(fils: number): number {
  return Number((fils / FILS_PER_BHD).toFixed(3));
}

export function isSessionLocked(startAt: Date | string | number, now = new Date()): boolean {
  const start = new Date(startAt).getTime();
  if (Number.isNaN(start)) throw new Error("Invalid session start time.");
  return now.getTime() >= start + ATTENDANCE_LOCK_AFTER_MINUTES * 60 * 1000;
}

export function arrearsDueAt(sessionEndAt: Date | string | number): Date {
  const end = new Date(sessionEndAt).getTime();
  if (Number.isNaN(end)) throw new Error("Invalid session end time.");
  return new Date(end + ARREARS_AFTER_HOURS * 60 * 60 * 1000);
}

/*
  Formula:
  Total available shuttlecocks = tubes × shuttles per tube + loose shuttlecocks.
  Total day cost in fils      = ceil(actual used × tube price in fils / shuttles per tube).
  Final attendee charge       = total day cost ÷ actual PRESENT members only.

  Any 1-fil remainder is assigned alphabetically by member UID so that the result
  is deterministic, auditable, and always adds back to exactly the total day cost.
*/
export function calculateShuttleCost(
  stock: StockBeforeGame,
  actualShuttlesUsed: number,
  presentMemberUids: string[]
): ShuttleCostResult {
  const { availableTubes, looseShuttles, shuttlesPerTube, tubePriceFils } = stock;

  for (const [name, value] of Object.entries({ availableTubes, looseShuttles, shuttlesPerTube, tubePriceFils, actualShuttlesUsed })) {
    if (!Number.isInteger(value) || value < 0) throw new Error(`${name} must be a whole number of zero or greater.`);
  }
  if (shuttlesPerTube < 1) throw new Error("Shuttles per tube must be at least 1.");
  if (tubePriceFils < 1) throw new Error("Tube price must be greater than zero.");

  const uniqueMembers = [...new Set(presentMemberUids.filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const totalAvailableShuttles = availableTubes * shuttlesPerTube + looseShuttles;

  if (actualShuttlesUsed > totalAvailableShuttles) {
    throw new Error("Actual shuttles used cannot be more than available stock.");
  }
  if (actualShuttlesUsed > 0 && uniqueMembers.length === 0) {
    throw new Error("At least one final PRESENT attendee is required to split shuttle cost.");
  }

  const totalDayCostFils = ceilDivide(actualShuttlesUsed * tubePriceFils, shuttlesPerTube);
  const baseChargeFils = uniqueMembers.length ? Math.floor(totalDayCostFils / uniqueMembers.length) : 0;
  const remainderFils = uniqueMembers.length ? totalDayCostFils % uniqueMembers.length : 0;

  const charges = uniqueMembers.map((memberUid, index) => ({
    memberUid,
    amountFils: baseChargeFils + (index < remainderFils ? 1 : 0)
  }));

  return {
    totalAvailableShuttles,
    actualShuttlesUsed,
    remainingShuttles: totalAvailableShuttles - actualShuttlesUsed,
    costPerShuttleExactFils: tubePriceFils / shuttlesPerTube,
    totalDayCostFils,
    attendeeCount: uniqueMembers.length,
    charges
  };
}

export function splitFilsEqually(totalFils: number, memberUids: string[]): PlayerCharge[] {
  if (!Number.isInteger(totalFils) || totalFils < 0) throw new Error("Total fils must be a whole number of zero or greater.");
  const members = [...new Set(memberUids.filter(Boolean))].sort((a, b) => a.localeCompare(b));
  if (!members.length && totalFils > 0) throw new Error("Cannot split a positive amount without members.");
  const base = members.length ? Math.floor(totalFils / members.length) : 0;
  const remainder = members.length ? totalFils % members.length : 0;
  return members.map((memberUid, index) => ({ memberUid, amountFils: base + (index < remainder ? 1 : 0) }));
}
