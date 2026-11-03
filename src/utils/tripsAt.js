import { vehicleOffsets } from "./vehicleOffsets.js";
import { scheduledTrips } from "./scheduledTrips.js";

// A lane with a `timetable` runs scheduled trips end to end; one with a `flow` (vehicles/h) loops evenly spaced vehicles.

export const tripsAt = (time, lanes, velocity) => lanes.flatMap((lane, l) => {
  const { timetable, flow = 0 } = lane.properties;
  if (!lane.length) return [];
  if (timetable) return scheduledTrips(time, timetable).map(trip => ({
    id: `${l}-${trip.id}`, lane, distance: trip.progress * lane.length, speed: lane.length / (timetable.duration * 60),
    properties: { ...lane.properties, departure: trip.departure },
  }));
  const travelled = time / 1000 * velocity;
  return (lane.offsets ||= vehicleOffsets(lane.length, flow, velocity))
    .map((offset, k) => ({ id: `${l}-${k}`, lane, distance: (offset + travelled) % lane.length, speed: velocity, properties: lane.properties }));
});
