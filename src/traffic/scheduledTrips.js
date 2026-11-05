import { clockMinutes } from './clockMinutes.js';
import { compareDepartures } from './compareDepartures.js';
import { state as sharedState } from '../state.js';

/**
 * Trips of a frequency-based timetable (like GTFS frequencies.txt) underway at `date`, in the timetable's local time.
 * @param {{timeZone: string, duration: number, services: Array<{from: string, to: string, every?: number, months?: number[], weekdays?: number[]}>}} timetable
 * `duration` and `every` are minutes; `from`/`to` are 'HH:MM' first/last departures; months are 1-12, weekdays 0 (Sunday)-6.
 * @returns {Array<{id: string, departure: string, progress: number}>} `progress` is 0-1 along the lane.
 */

export function scheduledTrips(date, { timeZone, duration, services }) {
  const time = date instanceof Date ? date
    : /* allocation: required -- Non-Date inputs need native date parsing and TimeClip behavior. */ new Date(date);
  if (!Number.isFinite(time.getTime())) throw /* allocation: required -- Report this invalid scheduling date with its own stack. */ new Error('Invalid date');
  let clock = sharedState.allocationTrafficClocks.get(timeZone);
  if (!clock) {
    clock = /* allocation: required -- Each timezone retains one native formatter in the bounded clock cache. */ new Intl.DateTimeFormat('en-GB',
      /* allocation: required -- The formatter owns the timezone and format used for its cached native state. */ {
        timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
      });
    if (sharedState.allocationTrafficClocks.size >= 32) {
      sharedState.allocationTrafficClocks.delete(sharedState.allocationTrafficClocks.keys().next().value);
    }
    sharedState.allocationTrafficClocks.set(timeZone, clock);
  }
  const parts = /* allocation: required -- Scheduling may reenter through service accessors; parsed clock parts belong to this call. */ {};
  let part, from, to, every, months, weekdays, departure;
  for (part of clock.formatToParts(time)) {
    if (part.type !== 'literal') parts[part.type] = Number(part.value);
  }
  const minute = parts.hour * 60 + parts.minute + (parts.second + time.getUTCMilliseconds() / 1000) / 60;
  const weekday = ((Math.floor(Date.UTC(parts.year, parts.month - 1, parts.day) / 86400000) + 4) % 7 + 7) % 7;
  const departures = /* allocation: required -- This timetable evaluation owns its sorted departures across service accessors. */ [];
  for ({ from, to, every = Infinity, months, weekdays } of services) {
    if (months?.includes(parts.month) === false || weekdays?.includes(weekday) === false) continue;
    for (departure = clockMinutes(from); departure <= clockMinutes(to); departure += every) departures.push(departure);
  }
  departures.sort(compareDepartures);
  const trips = /* allocation: required -- Each scheduling caller retains an independent trip list. */ [];
  for (departure of departures) {
    if (minute >= departure && minute < departure + duration) trips.push(/* allocation: required -- Each active departure retains independent progress and tooltip metadata. */ {
      id: `${parts.year}-${parts.month}-${parts.day}-${departure}`,
      departure: `${String(Math.floor(departure / 60)).padStart(2, '0')}:${String(departure % 60).padStart(2, '0')}`,
      progress: (minute - departure) / duration,
    });
  }
  return trips;
}
