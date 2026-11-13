import { kindByLayer } from '../weakmaps/kindByLayer.js';
import { L } from '../globals/L.js';
import { removeLayer as sharedRemoveLayer } from '../globals/removeLayer.js';
import { removeSceneLayer } from '../scene/removeSceneLayer.js';

/**
 * Remove a scene layer from this map, delegating ordinary layers to Leaflet.
 *
 * @param {L.Layer} layer Layer to remove.
 *
 * @returns {L.Map} This map.
 */
export function removeLayer(layer) {
  const id = L.Util.stamp(layer);
  if (!this._layers[id]) return this;

  if (!kindByLayer.get(layer)) return sharedRemoveLayer.value.call(this, layer);
  if (this._loaded) removeSceneLayer(layer, this);
  delete this._layers[id];
  if (this._loaded) {
    this.fire('layerremove', /* alloc */ { layer });
    layer.fire('remove');
  }
  layer._map = layer._mapToAdd = null;
  return this;
}
