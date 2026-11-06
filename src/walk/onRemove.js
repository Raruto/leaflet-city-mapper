import { walkByMap } from '../weakmaps/walkByMap.js';

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
