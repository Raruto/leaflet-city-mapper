import { render } from "../rendering/render.js";


export function onZoomAnim(event) {
  const map = this._map;
  if (event && !this._zoomView) {
    this._zoomView = { from: map.getCenter(), zoom: map.getZoom(), to: event.center,
      targetZoom: event.zoom, start: performance.now() };
    map.getContainer().classList.add('leaflet-camera-zoom');
  }
  queueMicrotask(() => {
    if (this._shared === this && this.renderer) render(this);
  });
}
