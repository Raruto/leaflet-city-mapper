import { rendererByLayer } from '../weakmaps/rendererByLayer.js';
import { rootByLayer } from '../weakmaps/rootByLayer.js';
import { limbs } from '../globals/limbs.js';
import { parts } from '../globals/parts.js';
import { moves } from '../globals/moves.js';
import * as createMesh from '../rendering/createMesh.js';
import { build } from '../geometry/buildGeometryParts.js';
import { local } from '../projections/walkerLocalPosition.js';
import { stepWalkerHeight } from './stepWalkerHeight.js';
import { resolveWalkerPosition } from './resolveWalkerPosition.js';
import { updateWalkerFrame } from './updateWalkerFrame.js';

/**
 * Advance one walk frame, checking clearance periodically and applying input, height and camera updates.
 *
 * @param {number} now Animation-frame timestamp in milliseconds.
 */
export function step(now) {
  const layer = this.layer;
  this.frame = requestAnimationFrame(this.step);
  const dt = Math.min(0.1, (now - (this.last ?? now)) / 1000);
  this.last = now;
  if (!rendererByLayer.get(layer)) return;
  let changed = false;
  let part, key;
  if (now >= this.nextClearanceCheck) {
    this.nextClearanceCheck = now + 250;
    if (resolveWalkerPosition.call(this)) changed = true;
  }
  if (!this.meshes) {
    this.meshes = /* alloc */ [];
    for ([part] of limbs) this.meshes.push(createMesh.createMesh(layer, build(parts[part])));
    changed = true;
  }
  const previousY = rootByLayer.get(layer).position[1] +
    local.call(this, this.local)[1] * rootByLayer.get(layer).scale[1];
  if (stepWalkerHeight.call(this, dt)) changed = true;
  let forward = 0, turn = 0;
  for (key of this.keys) { forward += moves[key]?.[0] || 0; turn += moves[key]?.[1] || 0; }
  forward = Math.sign(forward); turn = Math.sign(turn);
  updateWalkerFrame(this, previousY, forward, turn, dt, changed);
}
