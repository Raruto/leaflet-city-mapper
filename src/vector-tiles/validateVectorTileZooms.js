export function validateVectorTileZooms(minNativeZoom, maxNativeZoom, maxZoom) {
  if (!Number.isInteger(minNativeZoom) || !Number.isInteger(maxNativeZoom) || !Number.isInteger(maxZoom) ||
      minNativeZoom < 0 || maxNativeZoom < minNativeZoom || maxZoom < maxNativeZoom || maxZoom > 24) {
    throw /* alloc */ new Error('Invalid vector tile zoom range');
  }
}
