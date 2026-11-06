import { rendererByLayer } from '../weakmaps/rendererByLayer.js';
import { rootByLayer } from '../weakmaps/rootByLayer.js';

import { limbs } from '../globals/limbs.js';
import { parts } from '../globals/parts.js';
import { moves } from '../globals/moves.js';


import * as createMesh from '../rendering/createMesh.js';
import { build } from '../geometry/buildGeometryParts.js';

import { wrap } from '../utils/wrap.js';
import { local } from '../projections/walkerLocalPosition.js';
import { place } from './placeWalker.js';
import { land } from './landWalker.js';
import { moveWalker } from './moveWalker.js';
import { stepWalkerHeight } from './stepWalkerHeight.js';
import { updateWalkerView } from './updateWalkerView.js';

export function step(now) {
  const layer = this.layer;
  this.frame = requestAnimationFrame(this.step);
  const dt = Math.min(0.1, (now - (this.last ?? now)) / 1000);
  this.last = now;
  if (!rendererByLayer.get(layer)) return;
  let changed = false;
  let part, key;
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
  if (turn) { this.state.heading = wrap(this.state.heading + turn * 2.5 * dt); changed = true; }
  if (forward) {
    moveWalker.call(this, forward, dt);
    changed = true;
  }
  if (changed) land.call(this, previousY);
  if (updateWalkerView.call(this, forward, turn, dt)) changed = true;
  if (changed) place.call(this);
}
