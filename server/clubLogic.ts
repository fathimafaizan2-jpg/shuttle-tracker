// BUSINESS LOGIC & COST CALCULATION ENGINE
export const LOCK_DELAY_MS = 15 * 60 * 1000; // 15 Minutes
export const ARREARS_DELAY_MS = 24 * 60 * 60 * 1000; // 24 Hours

export function costPerActualAttendeeFils(tubePriceFils: number, tubesUsed: number, actualAttendees: number) {
  if (actualAttendees <= 0) return { totalSessionCostFils: 0, costPerPersonFils: 0 };
  const totalSessionCostFils = tubePriceFils * tubesUsed;
  const costPerPersonFils = Math.ceil(totalSessionCostFils / actualAttendees); // Rounds up so club never loses a fil
  return { totalSessionCostFils, costPerPersonFils };
}

export function isSessionLocked(startAtUtc: number, nowUtc = Date.now()): boolean {
  return nowUtc >= startAtUtc + LOCK_DELAY_MS;
}

export function isArrears(createdAtUtc: number, status: string, nowUtc = Date.now()): boolean {
  return status === "PENDING" && nowUtc >= createdAtUtc + ARREARS_DELAY_MS;
}
