import { initialize } from './initialize.js';
import { onAdd } from './onAdd.js';
import { onRemove } from './onRemove.js';

/**
 * Third-person walk mode, toggled by a map button (and Esc): a pedestrian at the map centre runs with W/S (or ↑/↓) and
 * turns with A/D (or ←/→); the camera swings back behind it while it moves. Dragging the map only turns the camera
 * (bearing, pitch); the wheel changes the camera distance.
 * The walker follows the terrain, bridges included, and `control.walker` exposes `{ latlng, heading, phase }`.
 * Options: `speed` (m/s, default 70), `distance` (camera distance in metres, default 20), `position` (button corner, default 'bottomright').
 * Visible meshes of the other 3D layers (buildings, trees, models, streetlights) are solid; terrain and traffic are not.
 */
L.Control.Walk = L.Control.extend({
  options: { position: 'bottomright', speed: 70, distance: 20 },
  initialize,
  onAdd,
  onRemove,
});
