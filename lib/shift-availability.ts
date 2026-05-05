/**
 * Utility functions for checking doctor shift availability
 * based on schedule (availableDays and availableHours)
 */

/**
 * Check if a given date is within the doctor's available days
 * @param date - Date to check (or Date object)
 * @param availableDays - Array of available day names (e.g., ['Monday', 'Tuesday', ...])
 * @returns true if the day is available
 */
export function isDateAvailable(date: string | Date, availableDays: string[]): boolean {
  if (!availableDays || availableDays.length === 0) return false;

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  
  return availableDays.some(day => day.toLowerCase() === dayName.toLowerCase());
}

/**
 * Parse a time string in 12-hour format (e.g., "09:00 AM") to minutes since midnight
 * @param timeStr - Time in 12-hour format
 * @returns Minutes since midnight, or null if invalid
 */
function parseTimeToMinutes(timeStr: string): number | null {
  if (!timeStr || typeof timeStr !== 'string') return null;
  
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3].toUpperCase();

  if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return null;

  if (hours === 12) hours = 0;
  if (meridiem === 'PM') hours += 12;

  return hours * 60 + minutes;
}

/**
 * Check if current time falls within available hours
 * @param availableHours - Array of hour slots (e.g., ['09:00 AM - 05:00 PM', '10:00 AM - 03:00 PM'])
 * @param currentTime - Optional current time (defaults to now)
 * @returns true if current time is within one of the available hour slots
 */
export function isTimeAvailable(availableHours: string[], currentTime?: Date): boolean {
  if (!availableHours || availableHours.length === 0) return false;

  const now = currentTime || new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return availableHours.some(hourSlot => {
    // Parse time slots like "09:00 AM - 05:00 PM"
    const parts = hourSlot.split('-').map(p => p.trim());
    if (parts.length !== 2) return false;

    const startMinutes = parseTimeToMinutes(parts[0]);
    const endMinutes = parseTimeToMinutes(parts[1]);

    if (startMinutes === null || endMinutes === null) return false;

    // Handle day-crossing slots (shouldn't happen for medical hours, but safe anyway)
    if (endMinutes < startMinutes) {
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }

    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  });
}

/**
 * Check if doctor is available right now (today and current time within hours)
 * @param availableDays - Array of available day names
 * @param availableHours - Array of available hour slots
 * @returns true if doctor is available now
 */
export function isDoctorAvailableNow(availableDays: string[], availableHours: string[]): boolean {
  return isDateAvailable(new Date(), availableDays) && isTimeAvailable(availableHours);
}

/**
 * Get a user-friendly message about why a doctor is not available
 * @param availableDays - Array of available day names
 * @param availableHours - Array of available hour slots
 * @returns Message explaining why not available
 */
export function getUnavailabilityReason(availableDays: string[], availableHours: string[]): string {
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const isDateOk = isDateAvailable(today, availableDays);
  const isTimeOk = isTimeAvailable(availableHours);

  if (!isDateOk) {
    return `${dayName} is not an available day. Available days: ${availableDays.join(', ')}`;
  }

  if (!isTimeOk) {
    return `Current time is outside your available hours. Available hours: ${availableHours.join(', ')}`;
  }

  return 'You are not currently available';
}
