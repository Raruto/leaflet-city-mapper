import { sizeByLayer } from '../weakmaps/sizeByLayer.js';
import { onMapChange } from '../scene/onMapChange.js';
import { startZoom } from '../animations/startZoom.js';
import { onZoomAnim } from '../animations/onZoomAnim.js';
import { endZoom } from '../animations/endZoom.js';

/**
 * Insert the rendering canvas and subscribe the layer to map and zoom events.
 *
 * @param {L.Layer} layer Layer receiving map events.
 * @param {L.Map} map Map receiving the canvas.
 * @param {HTMLCanvasElement} canvas WebGPU rendering canvas.
 */
export function mountRenderer(layer, map, canvas) {
  sizeByLayer.set(layer, null);
  canvas.className = 'leaflet-3d';
  canvas.style.cssText = 'position:absolute;top:0;left:0;z-index:1;pointer-events:none';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', layer.options.ariaLabel ?? '3D scene');
  map.getPane('mapPane').before(canvas);
  map.on('move zoom rotate pitch resize viewreset layeradd layerremove', onMapChange, layer);
  map.on('zoomstart', startZoom, layer);
  map.on('zoomanim', onZoomAnim, layer);
  map.on('zoomend', endZoom, layer);
}
