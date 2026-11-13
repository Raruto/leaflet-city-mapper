import { resizeMap } from './resizeMap.js';

/** Observe this handler's map container for size changes. */
export function containerResizeAddHooks() {
  const container = this._map.getContainer();
  container._containerResizeMap = this._map;
  this._observer = /* alloc */ new ResizeObserver(resizeMap);
  this._observer.observe(container);
}
