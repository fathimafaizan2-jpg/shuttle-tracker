export const FIXED_COURT_COUNT = 2;
export const ATTENDANCE_LOCK_DELAY_MS = 15 * 60 * 1000;
export const ARREARS_DELAY_MS = 24 * 60 * 60 * 1000;

export type ShuttleCostInput = {
  tubePriceFils: number;        // Price of one tube in fils: BHD 6.000 = 6000
  shuttlesPerTube: number;      // Example: 12 or 15
  availableTubeCount: number;   // Tubes currently available/opened for this flight
  looseShuttlesBeforeGame: number; // Shuttles remaining from earlier opened tubes
  shuttlesUsedAfterGame: number;   // Actual shuttles used after the game finishes
  actualAttendeeCount: number;  // Only players marked PRESENT after final correction
};

export type ShuttleCostResult = {
  costPerShuttleExactFils: number;
  totalShuttlesBeforeGame: number;
  shuttlesUsedAfterGame: number;
  remainingShuttles: number;
  totalDayCostFils: number;
  attendeeChargesFils: number[];
  normalChargeFils: number;
  oneFilExtraPlayerCount: number;
};

function requireWholeNonNegative(value: number, field: string) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${field} must be a whole number of zero or more`);
  }
}

function requirePositiveWhole(value: number, field: string) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${field} must be a positive whole number`);
  }
}

/**
 * Indian Club shuttlecock rule:
 *
 * cost of one shuttle = tube price ÷ shuttles per tube
 * day shuttle cost = actual shuttles used × cost of one shuttle
 * only actual attendees share that day cost
 * remaining shuttles = starting shuttles − actual shuttles used
 *
 * Fils are integers. If an equal split leaves a few fils, the first few
 * attendee charges receive one additional fil so the total is exact.
 */
export function calculateShuttleSessionCost(input: ShuttleCostInput): ShuttleCostResult {
  requireWholeNonNegative(input.tubePriceFils, "tubePriceFils");
  requirePositiveWhole(input.shuttlesPerTube, "shuttlesPerTube");
  requireWholeNonNegative(input.availableTubeCount, "availableTubeCount");
  requireWholeNonNegative(input.looseShuttlesBeforeGame, "looseShuttlesBeforeGame");
  requireWholeNonNegative(input.shuttlesUsedAfterGame, "shuttlesUsedAfterGame");
  requirePositiveWhole(input.actualAttendeeCount, "actualAttendeeCount");

  const totalShuttlesBeforeGame =
    input.availableTubeCount * input.shuttlesPerTube + input.looseShuttlesBeforeGame;

  if (input.shuttlesUsedAfterGame > totalShuttlesBeforeGame) {
    throw new Error("Used shuttles cannot be greater than available shuttles");
  }

  // Exact total cost in fils. ceil prevents the club from losing a fraction of one fil.
  const totalDayCostFils = Math.ceil(
    (input.tubePriceFils * input.shuttlesUsedAfterGame) / input.shuttlesPerTube
  );

  const normalChargeFils = Math.floor(totalDayCostFils / input.actualAttendeeCount);
  const oneFilExtraPlayerCount = totalDayCostFils % input.actualAttendeeCount;

  const attendeeChargesFils = Array.from(
    { length: input.actualAttendeeCount },
    (_, attendeeIndex) =>
      normalChargeFils + (attendeeIndex < oneFilExtraPlayerCount ? 1 : 0)
  );

  return {
    costPerShuttleExactFils: input.tubePriceFils / input.shuttlesPerTube,
    totalShuttlesBeforeGame,
    shuttlesUsedAfterGame: input.shuttlesUsedAfterGame,
    remainingShuttles: totalShuttlesBeforeGame - input.shuttlesUsedAfterGame,
    totalDayCostFils,
    attendeeChargesFils,
    normalChargeFils,
    oneFilExtraPlayerCount
  };
}

/** Returns true exactly 15 minutes after scheduled game start. */
export function isAttendanceLocked(sessionStartAtUtc: number, nowUtc = Date.now()) {
  requireWholeNonNegative(sessionStartAtUtc, "sessionStartAtUtc");
  return nowUtc >= sessionStartAtUtc + ATTENDANCE_LOCK_DELAY_MS;
}

/** Payment becomes arrears exactly one day after it remains pending. */
export function isPaymentArrears(
  paymentCreatedAtUtc: number,
  paymentStatus: "PENDING" | "VERIFIED" | "PAID" | "ARREARS",
  nowUtc = Date.now()
) {
  requireWholeNonNegative(paymentCreatedAtUtc, "paymentCreatedAtUtc");
  return paymentStatus === "PENDING" && nowUtc >= paymentCreatedAtUtc + ARREARS_DELAY_MS;
}

/** Every timetable cell is permanently two courts. */
export function fixedCourtCount() {
  return FIXED_COURT_COUNT;
}

/**
 * The Super Admin creates one weekly timetable pattern.
 * The same weekday/time/flight pattern repeats across the selected month.
 */
export function repeatingWeeklyDatesForMonth(
  year: number,
  monthIndexZeroBased: number,
  weekdayZeroSunday: number
) {
  requirePositiveWhole(year, "year");
  if (!Number.isInteger(monthIndexZeroBased) || monthIndexZeroBased < 0 || monthIndexZeroBased > 11) {
    throw new Error("monthIndexZeroBased must be between 0 and 11");
  }
  if (!Number.isInteger(weekdayZeroSunday) || weekdayZeroSunday < 0 || weekdayZeroSunday > 6) {
    throw new Error("weekdayZeroSunday must be between 0 and 6");
  }

  const dates: number[] = [];
  const day = new Date(Date.UTC(year, monthIndexZeroBased, 1));
  while (day.getUTCMonth() === monthIndexZeroBased) {
    if (day.getUTCDay() === weekdayZeroSunday) dates.push(day.getTime());
    day.setUTCDate(day.getUTCDate() + 1);
  }
  return dates;
}

/** Converts fils to BHD display text. */
export function filsToBhd(fils: number) {
  requireWholeNonNegative(Math.abs(fils), "fils");
  return (fils / 1000).toFixed(3);
}
