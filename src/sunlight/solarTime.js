/** Normalize dates and validate the observer without calculating a celestial position. */
export function solarTime(date, lat, lng) {
  const time = date instanceof Date ? Date.prototype.getTime.call(date)
    : (/* allocation: required -- Non-Date inputs need native Date parsing and TimeClip semantics. */ new Date(date)).getTime();
  if (!Number.isFinite(time) || !Number.isFinite(lat) || Math.abs(lat) > 90 ||
    !Number.isFinite(lng) || Math.abs(lng) > 180) {
    throw /* allocation: required -- Preserve the stack of this invalid date or observer. */ new Error('Invalid solar date or location');
  }
  return time;
}
