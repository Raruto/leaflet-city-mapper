/**
 * Fetch TileJSON metadata and merge its tile URL and defaults into source options.
 *
 * @param {Object} options Source options including the TileJSON URL.
 *
 * @returns {Promise<Object>} Options with resolved tile URL and metadata.
 *
 * @throws {Error} If the metadata request returns an unsuccessful status.
 * @throws {Error} If the metadata lacks a tile URL template.
 */
export async function readTileJSON(options) {
  const url = /* alloc */ new URL(options.tileJSON, document.baseURI).href;
  const response = await fetch(url);
  if (!response.ok) throw /* alloc */ new Error(`TileJSON: HTTP ${response.status}`);
  const metadata = await response.json();
  if (!metadata || !Array.isArray(metadata.tiles) || !metadata.tiles.length ||
      typeof metadata.tiles[0] !== 'string') {
    throw /* alloc */ new Error('TileJSON requires a tile URL template');
  }
  return /* alloc */ {
    ...options,
    url: /* alloc */ new URL(metadata.tiles[0], url).href,
    minNativeZoom: options.minNativeZoom ?? metadata.minzoom,
    maxNativeZoom: options.maxNativeZoom ?? metadata.maxzoom,
    attribution: options.attribution ?? metadata.attribution,
  };
}
