import { installWalk } from '../utils/installWalk.js';

/**
 * Third-person walk mode, toggled by a map button (and Esc): a pedestrian at the map centre runs with W/S (or ↑/↓) and
 * turns with A/D (or ←/→); the camera swings back behind it while it moves. Dragging the map only turns the camera
 * (bearing, pitch); the wheel changes the camera distance.
 * The walker follows the terrain, bridges included, and `layer.walker` exposes `{ latlng, heading, phase }`.
 * Source options: `speed` (m/s, default 6), `distance` (camera distance in metres, default 20), `position` (button corner, default 'topleft').
 * Visible meshes of the other 3D layers (buildings, trees, models, streetlights) are solid; terrain and traffic are not.
 */
L.Layer.types.walk = L.Layer.types['3d'].extend({
  initialize(options) { return installWalk(this, options); },
});
