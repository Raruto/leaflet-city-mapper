import './3d.js';
import { speed } from '../utils/speed.js';
import { vehicles } from '../utils/vehicles.js';
import { installTraffic } from '../utils/installTraffic.js';
import { tooltip } from '../utils/tooltip.js';

/**
 * Vehicles moving along GeoJSON lanes; a compute pass places them on the GPU every frame.
 * Source options:
 * - `url`: GeoJSON (Multi)LineStrings, or a JS module whose default export `(time, layer, signal)` returns them (time-dependent data);
 * - `vehicle`: 'car' (default) or 'boat'; `side`: offset right of the lane centreline in metres (vehicle default);
 * - `speed`: m/s of `flow` lanes; `outline`: draw the lanes.
 * Lane properties: `flow` (vehicles/h) or `timetable` (see scheduledTrips.js), optional fixed `elevation`
 * in metres, `name`/`description` for the default tooltip. The status line (vehicle count, then the FeatureCollection `note`) sits under the layer's entry in the layers control.
 * The 'sunlight' layer on the same map drives the time; without one, vehicles run live.
 */
L.Layer.types.traffic = L.Layer.types['3d'].extend({
  initialize({ url, vehicle = 'car', side, outline = false, speed: velocity = speed, ...options } = {}) {
    if (!url) throw new Error('Traffic needs a source url');
    if (!vehicles[vehicle]) throw new Error(`Unknown vehicle: ${vehicle}`);
    L.Layer.types['3d'].prototype.initialize.call(this, { tooltipContent: tooltip, nightLight: Boolean(vehicles[vehicle].lights), ...options });
    installTraffic(this, { url, ...vehicles[vehicle], side: side ?? vehicles[vehicle].side, outline, velocity });
  },
});
