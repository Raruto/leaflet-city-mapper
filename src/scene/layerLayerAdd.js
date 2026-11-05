import { state as sharedState } from '../state.js';
import { pluginState } from '../core/pluginState.js';

import { initNativeGPU } from '../core/initNativeGPU.js';
import { removeLayerEvents } from './removeLayerEvents.js';

export function layerLayerAdd(event) {
  const native = !pluginState(this)._3d && (
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
  const map = event.target, state = pluginState(this);
  if (!map.hasLayer(this)) return;
  if (state.onAdd) {
    this._map = map;
    this._zoomAnimated = map._zoomAnimated;
    if (state.getEvents) {
      state.events = state.getEvents.call(this);
      state.eventMap = map;
      map.on(state.events, this);
      this.once('remove', removeLayerEvents, this);
    }
    state.onAdd.call(this, map);
    this.fire('add');
    map.fire('layeradd', /* allocation: required -- Give listeners an independent native layer event payload. */ { layer: this });
  } else {
    sharedState.layerProto._layerAdd.call(this, event);
  }
  if (!native || !event.target.hasLayer(this)) return;
  initNativeGPU(this, event.target);
}
