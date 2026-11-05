import { resizeMap } from './resizeMap.js';

export function containerResizeAddHooks() {
  const container = this._map.getContainer();
  container._containerResizeMap = this._map;
  this._observer = /* allocation: required -- Each handler owns an observer it disconnects on removal. */ new ResizeObserver(resizeMap);
  this._observer.observe(container);
}
