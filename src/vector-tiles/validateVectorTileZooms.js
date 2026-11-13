/**
 * Validate the native and map zoom limits for a vector tile source.
 *
 * @param {number} minNativeZoom Minimum native zoom.
 * @param {number} maxNativeZoom Maximum native zoom.
 * @param {number} maxZoom Maximum map zoom.
 *
 * @throws {Error} If the zoom limits are noninteger, unordered or outside the supported range.
 */
export function validateVectorTileZooms(minNativeZoom, maxNativeZoom, maxZoom) {
  if (!Number.isInteger(minNativeZoom) || !Number.isInteger(maxNativeZoom) || !Number.isInteger(maxZoom) ||
      minNativeZoom < 0 || maxNativeZoom < minNativeZoom || maxZoom < maxNativeZoom || maxZoom > 24) {
    throw /* alloc */ new Error('Invalid vector tile zoom range');
  }
}
