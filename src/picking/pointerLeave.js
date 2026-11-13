import * as onPointerLeave from './onPointerLeave.js';

/** Clear this layer's feature hover state when the pointer leaves. */
export function pointerLeave() {
  onPointerLeave.onPointerLeave(this);
}
