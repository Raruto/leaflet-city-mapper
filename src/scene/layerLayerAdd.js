import { eventMapByLayer } from '../weakmaps/eventMapByLayer.js';
import { eventsByLayer } from '../weakmaps/eventsByLayer.js';
import { kindByLayer } from '../weakmaps/kindByLayer.js';
import { state3dByLayer } from '../weakmaps/state3dByLayer.js';
import { mutateWeakMap } from '../weakmaps/mutateWeakMap.js';

import { L } from '../globals/L.js';
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
  const map = event.target
  if (!map.hasLayer(this)) return;
  if (kindByLayer.get(this)) {
    this._map = map;
    this._zoomAnimated = map._zoomAnimated;
    if (kindByLayer.get(this) !== 'pending' && kindByLayer.get(this) !== 'time') {
      mutateWeakMap(eventsByLayer, this, "=", kindByLayer.get(this) === 'raster' ? getRasterEvents(this) :
        state3dByLayer.get(this) ? get3DEvents(this) : emptyEvents());
      mutateWeakMap(eventMapByLayer, this, "=", map);
      map.on(eventsByLayer.get(this), this);
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
