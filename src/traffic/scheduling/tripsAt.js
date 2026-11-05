import { vehicleOffsets } from "../simulation/vehicleOffsets.js";
import { scheduledTrips } from "./scheduledTrips.js";

// A lane with a `timetable` runs scheduled trips end to end; one with a `flow` (vehicles/h) loops evenly spaced vehicles.

export function tripsAt(time, lanes, velocity) {
  const trips = [];
  for (let l = 0; l < lanes.length; l++) {
    const lane = lanes[l];
    const { timetable, flow = 0 } = lane.properties;
    if (!lane.length) continue;
    if (timetable) {
      for (const trip of scheduledTrips(time, timetable)) trips.push({
        id: `${l}-${trip.id}`, lane, distance: trip.progress * lane.length, speed: lane.length / (timetable.duration * 60),
        properties: { ...lane.properties, departure: trip.departure },
      });
    } else {
      const travelled = time / 1000 * velocity;
      const offsets = lane.offsets ||= vehicleOffsets(lane.length, flow, velocity);
      for (let k = 0; k < offsets.length; k++) trips.push({
        id: `${l}-${k}`, lane, distance: (offsets[k] + travelled) % lane.length, speed: velocity, properties: lane.properties,
      });
    }
  }
  return trips;
}
