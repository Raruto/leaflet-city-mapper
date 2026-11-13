import { walkByMap } from '../weakmaps/walkByMap.js';

/**
 * Stop and detach the current walk control while retaining reusable map-owned scratch.
 *
 * @param {L.Map} map Map from which the control is removed.
 */
export function onRemove(map) {
  const state = walkByMap.get(map);
  if (state?.control !== this) return;
  this._walk.stop();
  this._walk.layer.remove();
  state.control = null;
  state.hitData.seen.clear();
  this._walk.hitData = null;
  this._walk.local = null;
}
