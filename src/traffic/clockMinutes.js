

/**
 * Convert an HH:MM clock string to minutes after midnight.
 *
 * @param {string} clockTime Clock time in HH:MM form.
 *
 * @returns {number} Minutes after midnight.
 */
export function clockMinutes(clockTime) {
  const parts = clockTime.split(':');
  return Number(parts[0]) * 60 + Number(parts[1]);
}
