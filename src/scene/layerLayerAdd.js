import { L } from '../globals/L.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';
import { layerProto } from '../globals/layerProto.js';



import { initNativeGPU } from '../core/initNativeGPU.js';
import { removeLayerEvents } from './removeLayerEvents.js';
import { addSceneLayer } from './addSceneLayer.js';
import { get3DEvents } from './get3DEvents.js';
import { getRasterEvents } from '../raster/getRasterEvents.js';
import { emptyEvents } from './emptyEvents.js';
import { isNativeLayer } from './isNativeLayer.js';

export function layerLayerAdd(event) {
  const native = isNativeLayer(this);
  if (native) {
    if (this instanceof L.GridLayer || this instanceof L.ImageOverlay) {
      this.options.crossOrigin ||= true;
    }
    if (this instanceof L.Marker) this.options.icon.options.crossOrigin ||= true;
  }
  const map = event.target, state = sceneByLayer.get(this);
  if (!map.hasLayer(this)) return;
  if (state.kind) {
    this._map = map;
    this._zoomAnimated = map._zoomAnimated;
    if (state.kind !== 'pending' && state.kind !== 'time') {
      state.events = state.kind === 'raster' ? getRasterEvents(this) :
        state._3d ? get3DEvents(this) : emptyEvents();
      state.eventMap = map;
      map.on(state.events, this);
      this.once('remove', removeLayerEvents, this);
    }
    addSceneLayer(this, map);
    this.fire('add');
    map.fire('layeradd', /* alloc */ { layer: this });
  } else {
    layerProto.value._layerAdd.call(this, event);
  }
  if (!native || !event.target.hasLayer(this)) return;
  initNativeGPU(this, event.target);
}
