/** Find a raster tile's active CSS level to reproduce Leaflet's animated scale/rounding. */

export function getTileLevel(backend) {
  let level;
  backend._map.eachLayer(layer => {
    if (!level && layer instanceof L.TileLayer && layer._levels) {
      level = layer._levels[layer._tileZoom];
    }
  });
  return level;
}
