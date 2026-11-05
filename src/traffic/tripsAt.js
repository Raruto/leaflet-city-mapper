import { vehicleOffsets } from "./vehicleOffsets.js";
import { scheduledTrips } from "./scheduledTrips.js";

// A lane with a `timetable` runs scheduled trips end to end; one with a `flow` (vehicles/h) loops evenly spaced vehicles.

export function tripsAt(time, lanes, velocity) {
  const trips = /* alloc */ [];
  let l, lane, timetable, flow, trip, travelled, offsets, k;
  for (l = 0; l < lanes.length; l++) {
    lane = lanes[l];
    ({ timetable, flow = 0 } = lane.properties);
    if (!lane.length) continue;
    if (timetable) {
      for (trip of scheduledTrips(time, timetable)) trips.push(/* alloc */ {
        id: `${l}-${trip.id}`, lane, distance: trip.progress * lane.length, speed: lane.length / (timetable.duration * 60),
        properties: /* alloc */ { ...lane.properties, departure: trip.departure },
      });
    } else {
      travelled = time / 1000 * velocity;
      offsets = lane.offsets ||= vehicleOffsets(lane.length, flow, velocity);
      for (k = 0; k < offsets.length; k++) trips.push(/* alloc */ {
        id: `${l}-${k}`, lane, distance: (offsets[k] + travelled) % lane.length, speed: velocity, properties: lane.properties,
      });
    }
  }
  return trips;
}
