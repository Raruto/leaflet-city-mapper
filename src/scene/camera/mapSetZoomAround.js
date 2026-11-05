import { mapCameraState } from './constants/mapCameraState.js';

export function mapSetZoomAround(latlng, zoom, options) {
  if (!this.getPitch() && !this.getBearing()) return mapCameraState.mapMethods.setZoomAround.call(this, latlng, zoom, options);
  zoom = this._limitZoom(zoom);
  const scale = this.getZoomScale(zoom), half = this.getSize().divideBy(2);
  const screen = latlng instanceof L.Point ? latlng : this.latLngToContainerPoint(latlng);
  const center = this.containerPointToLayerPoint(half), anchor = this.containerPointToLayerPoint(screen);
  const next = center.add(anchor.subtract(center).multiplyBy(1 - 1 / scale));
  return this.setView(this.layerPointToLatLng(next), zoom, { zoom: options });
}
