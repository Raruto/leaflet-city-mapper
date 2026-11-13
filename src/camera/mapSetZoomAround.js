import { L } from '../globals/L.js';
import { mapMethods } from '../globals/mapMethods.js';
import { mapGetPitch } from './mapGetPitch.js';
import { mapGetBearing } from './mapGetBearing.js';

/**
 * Zoom around a geographic location or screen point while preserving the camera anchor.
 *
 * @param {L.LatLng|L.Point} latlng Geographic location or container point.
 * @param {number} zoom Target zoom.
 * @param {Object} options Leaflet zoom options.
 *
 * @returns {L.Map} This map.
 */
export function mapSetZoomAround(latlng, zoom, options) {
  if (!mapGetPitch(this) && !mapGetBearing(this)) return mapMethods.value.setZoomAround.call(this, latlng, zoom, options);
  zoom = this._limitZoom(zoom);
  const scale = this.getZoomScale(zoom), half = this.getSize().divideBy(2);
  const screen = latlng instanceof L.Point ? latlng : this.latLngToContainerPoint(latlng);
  const center = this.containerPointToLayerPoint(half), anchor = this.containerPointToLayerPoint(screen);
  const next = center.add(anchor.subtract(center).multiplyBy(1 - 1 / scale));
  return this.setView(this.layerPointToLatLng(next), zoom, /* alloc */ { zoom: options });
}
