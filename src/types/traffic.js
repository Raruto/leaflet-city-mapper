import './3d.js';
import { installTraffic } from '../utils/installTraffic.js';

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
  initialize(options) { return installTraffic(this, options); },
});
