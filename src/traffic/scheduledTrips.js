import { clockMinutes } from './clockMinutes.js';
import { compareDepartures } from './compareDepartures.js';

/**
 * Trips of a frequency-based timetable (like GTFS frequencies.txt) underway at `date`, in the timetable's local time.
 * @param {{timeZone: string, duration: number, services: Array<{from: string, to: string, every?: number, months?: number[], weekdays?: number[]}>}} timetable
 * `duration` and `every` are minutes; `from`/`to` are 'HH:MM' first/last departures; months are 1-12, weekdays 0 (Sunday)-6.
 * @returns {Array<{id: string, departure: string, progress: number}>} `progress` is 0-1 along the lane.
 */

export function scheduledTrips(date, { timeZone, duration, services }) {
  const time = new Date(date);
  if (!Number.isFinite(time.getTime())) throw new Error('Invalid date');
  const clock = new Intl.DateTimeFormat('en-GB', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  });
  const parts = {};
  let part, from, to, every, months, weekdays, departure;
  for (part of clock.formatToParts(time)) {
    if (part.type !== 'literal') parts[part.type] = Number(part.value);
  }
  const minute = parts.hour * 60 + parts.minute + (parts.second + time.getUTCMilliseconds() / 1000) / 60;
  const weekday = new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay();
  const departures = [];
  for ({ from, to, every = Infinity, months, weekdays } of services) {
    if (months?.includes(parts.month) === false || weekdays?.includes(weekday) === false) continue;
    for (departure = clockMinutes(from); departure <= clockMinutes(to); departure += every) departures.push(departure);
  }
  departures.sort(compareDepartures);
  const trips = [];
  for (departure of departures) {
    if (minute >= departure && minute < departure + duration) trips.push({
      id: `${parts.year}-${parts.month}-${parts.day}-${departure}`,
      departure: `${String(Math.floor(departure / 60)).padStart(2, '0')}:${String(departure % 60).padStart(2, '0')}`,
      progress: (minute - departure) / duration,
    });
  }
  return trips;
}
