import { vectorTileOptionsByLayer } from '../weakmaps/vectorTileOptionsByLayer.js';

// Style zooms are authored for 512px tiles (MapLibre): `styleZoomOffset: -1` maps Leaflet's 256px zoom onto them.
export function vectorStyleZoom(layer) {
  return layer._map.getZoom() + (vectorTileOptionsByLayer.get(layer).styleZoomOffset ?? 0);
}
