import { indexState } from './constants/indexState.js';
import { initNativeGPU } from '../core/initNativeGPU.js';

export function layerLayerAdd(event) {
  const native = !this._3d && (
    this instanceof L.GridLayer ||
    this instanceof L.Polyline ||
    this instanceof L.CircleMarker ||
    this instanceof L.Marker && !(this.options.icon instanceof L.DivIcon) ||
    this instanceof L.ImageOverlay && !(this instanceof L.VideoOverlay) && !(this instanceof L.SVGOverlay)
  );
  if (native) {
    if (this instanceof L.GridLayer || this instanceof L.ImageOverlay) {
      this.options.crossOrigin ||= true;
    }
    if (this instanceof L.Marker) this.options.icon.options.crossOrigin ||= true;
  }
  indexState.layerProto._layerAdd.call(this, event);
  if (!native || !event.target.hasLayer(this)) return;
  initNativeGPU(this, event.target);
}
