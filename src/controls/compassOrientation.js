import { mapSetBearing } from '../camera/mapSetBearing.js';

/**
 * Update the handler's map bearing from a device orientation event.
 *
 * @param {DeviceOrientationEvent} event Device orientation reading.
 */
export function compassOrientation(event) {
  const handler = this.handler;
  const bearing = Number.isFinite(event.webkitCompassHeading) ? -event.webkitCompassHeading : event.alpha;
  const orientation = event.absolute ? 0 : (screen.orientation?.angle ?? window.orientation ?? 0);
  if (Number.isFinite(bearing)) mapSetBearing(handler._map, bearing - orientation);
}
