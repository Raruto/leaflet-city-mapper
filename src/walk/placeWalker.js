import { limbs } from '../globals/limbs.js';
import { update } from '../scene/scheduleSceneUpdate.js';
import { local } from '../projections/walkerLocalPosition.js';

/** Place and animate the walker meshes at the current position and heading, then request a scene update. */
export function place() {
  const [x, y, z] = local.call(this, this.local);
  // Model forward is -z; a yaw of -heading turns it to the compass heading (x east, -z north).
  const yaw = -this.state.heading, cos = Math.cos(yaw), sin = Math.sin(yaw);
  let i, px, py, sign, mesh;
  for (i = 0; i < limbs.length; i++) {
    [, px, py, sign] = limbs[i];
    mesh = this.meshes[i];
    mesh.position[0] = x + px * cos; mesh.position[1] = y + py; mesh.position[2] = z - px * sin;
    mesh.rotation[0] = sign * this.swing * Math.sin(this.state.phase);
    mesh.rotation[1] = yaw;
  }
  update(this.layer);
}
