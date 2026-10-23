/**
 * LocalLoop Operating Hours & Validation Utilities
 * Checkpoint CP-SP04: Operating hours configuration, validation & live status
 */

export type DayOfWeek = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export const ALL_DAYS: DayOfWeek[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export interface OperatingHoursConfig {
  openTime: string; // "HH:MM" in 24h
  closeTime: string; // "HH:MM" in 24h
  days: DayOfWeek[];
}

export interface OperatingHoursValidationResult {
  valid: boolean;
  error?: string;
}

export interface LiveStoreStatus {
  isOpen: boolean;
  badgeText: string;
  detail: string;
}

/**
 * Converts 24-hour "HH:MM" to 12-hour "H:MM AM/PM"
 */
export function formatTo12Hour(time24: string): string {
  if (!time24 || !time24.includes(":")) return "9:00 AM";
  const [hStr, mStr] = time24.split(":");
  let hour = parseInt(hStr, 10);
  const minutes = mStr.padStart(2, "0");
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minutes} ${period}`;
}

/**
 * Converts 12-hour "H:MM AM/PM" string to 24-hour "HH:MM"
 */
export function parse12HourTo24(time12: string): string {
  if (!time12) return "09:00";
  const match = time12.trim().match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)/i);
  if (!match) return "09:00";
  let hour = parseInt(match[1], 10);
  const minute = match[2] ? match[2].padStart(2, "0") : "00";
  const period = match[3].toUpperCase();

  if (period === "PM" && hour < 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;

  return `${String(hour).padStart(2, "0")}:${minute}`;
}

/**
 * Parses a combined string like "7:00 AM - 9:00 PM (Mon-Sat)" into structured config
 */
export function parseOperatingHoursString(str: string): OperatingHoursConfig {
  const defaultConfig: OperatingHoursConfig = {
    openTime: "07:00",
    closeTime: "21:00",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  };

  if (!str || !str.trim()) return defaultConfig;

  const timesMatch = str.match(/(\d{1,2}(?::\d{2})?\s*(?:AM|PM))\s*-\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM))/i);
  let openTime = defaultConfig.openTime;
  let closeTime = defaultConfig.closeTime;

  if (timesMatch) {
    openTime = parse12HourTo24(timesMatch[1]);
    closeTime = parse12HourTo24(timesMatch[2]);
  }

  let days = defaultConfig.days;
  if (str.toLowerCase().includes("all days") || str.toLowerCase().includes("every day")) {
    days = [...ALL_DAYS];
  } else if (str.toLowerCase().includes("mon-sat") || str.toLowerCase().includes("mon - sat")) {
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  } else if (str.toLowerCase().includes("mon-fri") || str.toLowerCase().includes("mon - fri")) {
    days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  }

  return { openTime, closeTime, days };
}

/**
 * Formats structured config into human-readable store string
 */
export function formatOperatingHoursString(
  openTime: string,
  closeTime: string,
  days: DayOfWeek[]
): string {
  const open12 = formatTo12Hour(openTime);
  const close12 = formatTo12Hour(closeTime);

  let daysLabel = "";
  if (days.length === 7) {
    daysLabel = "Every day";
  } else if (days.length === 6 && !days.includes("Sun")) {
    daysLabel = "Mon - Sat";
  } else if (days.length === 5 && !days.includes("Sat") && !days.includes("Sun")) {
    daysLabel = "Mon - Fri";
  } else {
    daysLabel = days.join(", ");
  }

  return `${open12} - ${close12} (${daysLabel})`;
}

/**
 * Validates operating hours configuration (CP-SP04 validation rules)
 */
export function validateOperatingHours(
  openTime: string,
  closeTime: string,
  days: DayOfWeek[]
): OperatingHoursValidationResult {
  if (!openTime || !closeTime) {
    return { valid: false, error: "Both opening and closing times must be specified." };
  }

  if (!days || days.length === 0) {
    return { valid: false, error: "At least one operational day must be selected." };
  }

  const [openH, openM] = openTime.split(":").map(Number);
  const [closeH, closeM] = closeTime.split(":").map(Number);

  if (isNaN(openH) || isNaN(openM) || isNaN(closeH) || isNaN(closeM)) {
    return { valid: false, error: "Invalid time format provided." };
  }

  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  if (closeMinutes <= openMinutes) {
    return {
      valid: false,
      error: "Closing time must be later than opening time.",
    };
  }

  const durationMinutes = closeMinutes - openMinutes;
  if (durationMinutes < 30) {
    return {
      valid: false,
      error: "Operating hours window must be at least 30 minutes long.",
    };
  }

  return { valid: true };
}

/**
 * Checks if the store is currently within operating hours given a reference timestamp
 */
export function checkLiveOperatingStatus(
  openTime: string,
  closeTime: string,
  days: DayOfWeek[],
  isCounterOpen: boolean = true,
  refDate?: Date
): LiveStoreStatus {
  if (!isCounterOpen) {
    return {
      isOpen: false,
      badgeText: "Manually Closed",
      detail: "Merchant paused counter pickups",
    };
  }

  const now = refDate || new Date();
  const dayNames: DayOfWeek[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const currentDay = dayNames[now.getDay()];

  if (!days.includes(currentDay)) {
    return {
      isOpen: false,
      badgeText: "Closed Today",
      detail: `Store is closed on ${currentDay}s`,
    };
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [openH, openM] = openTime.split(":").map(Number);
  const [closeH, closeM] = closeTime.split(":").map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  const open12 = formatTo12Hour(openTime);
  const close12 = formatTo12Hour(closeTime);

  if (currentMinutes < openMinutes) {
    return {
      isOpen: false,
      badgeText: "Closed Now",
      detail: `Opens today at ${open12}`,
    };
  }

  if (currentMinutes >= closeMinutes) {
    return {
      isOpen: false,
      badgeText: "Closed for the Day",
      detail: `Closed at ${close12}`,
    };
  }

  return {
    isOpen: true,
    badgeText: "Open Now",
    detail: `Open until ${close12}`,
  };
}
