export function mapUpdateCameraOverlays() {
  let layer;
  for (layer of Object.values(this._layers)) {
    if (layer instanceof L.Marker) layer.update();
    else if (layer instanceof L.Popup || layer instanceof L.Tooltip) layer._updatePosition();
  }
}
