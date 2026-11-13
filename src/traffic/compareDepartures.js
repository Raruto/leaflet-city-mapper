

/**
 * Order departure times numerically.
 *
 * @param {number} a First departure in minutes.
 * @param {number} b Second departure in minutes.
 *
 * @returns {number} Signed difference between the departures.
 */
export function compareDepartures(a, b) {
  return a - b;
}
