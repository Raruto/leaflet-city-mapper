import { resizeMap } from './resizeMap.js';

export function containerResizeAddHooks() {
  const container = this._map.getContainer();
  container._containerResizeMap = this._map;
  this._observer = /* alloc */ new ResizeObserver(resizeMap);
  this._observer.observe(container);
}
