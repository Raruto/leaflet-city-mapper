import { L } from '../globals/L.js';
import { initialize } from './initializeWalkControl.js';
import { onAdd } from './onAddWalkControl.js';
import { onRemove } from './onRemoveWalkControl.js';

/**
 * Third-person walk mode, toggled by a map button (and Esc): a pedestrian at the map centre runs with W/S (or ↑/↓) and
 * turns with A/D (or ←/→); the camera swings back behind it while it moves. Dragging the map only turns the camera
 * (bearing, pitch); the wheel changes the camera distance.
 * The walker follows the terrain, bridges included, and `control.walker` exposes `{ latlng, heading, phase }`.
 * Options: `speed` (m/s, default 70), `distance` (camera distance in metres, default 20), `position` (button corner, default 'bottomright').
 * Buildings, trees, models, streetlights and traffic block movement; the walker is moved out of newly loaded obstacles.
 */
class WalkControl extends L.Control {
  static defaultOptions = { position: 'bottomright', speed: 70, distance: 20 };

  constructor(options) {
    super(options);
    if (L.version.startsWith('2.')) initialize.call(this, options);
  }
}
Object.assign(WalkControl.prototype, { onAdd, onRemove });
if (L.version.startsWith('1.')) {
  WalkControl.prototype.options = Object.assign(Object.create(L.Control.prototype.options), WalkControl.defaultOptions);
  WalkControl.prototype.initialize = initialize;
}
L.Control.Walk = WalkControl;
