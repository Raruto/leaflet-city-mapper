/**
 * Read bridge GeoJSON from a successful HTTP response.
 *
 * @param {Response} response Bridge request response.
 *
 * @returns {Promise<Object>} Parsed bridge GeoJSON.
 *
 * @throws {Error} If the response has a non-success status.
 */
export function readBridges(response) {
  if (!response.ok) throw /* alloc */ new Error(`Bridges: HTTP ${response.status}`);
  return response.json();
}
