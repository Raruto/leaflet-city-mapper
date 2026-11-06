import { walkByMap } from '../weakmaps/walkByMap.js';

export function onAdd(map) {
  let state = walkByMap.get(map);
  if (state?.control && state.control !== this) {
    this._map = null;
    throw /* alloc */ new Error('Only one Walk control can be active per map');
  }
  if (!state) {
    state = /* alloc */ {
      control: null,
      hitData: /* alloc */ {
        x: 0, y: 0, z: 0, dx: 0, dz: 0, reach: 0, best: 0, found: false,
        seen: /* alloc */ new Set(),
        normal: /* alloc */ [0, 0],
      },
      local: /* alloc */ [0, 0, 0],
    };
    walkByMap.set(map, state);
  }
  state.control = this;
  state.local.fill(0);
  state.hitData.seen.clear();
  state.hitData.normal.fill(0);
  this._walk.hitData = state.hitData;
  this._walk.local = state.local;
  this._walk.layer.addTo(map);
  return this._walk.container;
}
