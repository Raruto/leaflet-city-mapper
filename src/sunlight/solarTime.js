/** Normalize dates and validate the observer without calculating a celestial position. */
export function solarTime(date, lat, lng) {
  const time = date instanceof Date ? Date.prototype.getTime.call(date)
    : typeof date === 'string' ? Date.parse(date)
    : (/* alloc */ new Date(date)).getTime();
  if (!Number.isFinite(time) || !Number.isFinite(lat) || Math.abs(lat) > 90 ||
    !Number.isFinite(lng) || Math.abs(lng) > 180) {
    throw /* alloc */ new Error('Invalid solar date or location');
  }
  return time;
}
