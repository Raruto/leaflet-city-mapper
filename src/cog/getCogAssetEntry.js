import { decompress } from '../archives/decompress.js';
import { readCog } from './readCog.js';

/**
 * Read and validate a named COG asset entry from PMTiles metadata.
 *
 * @param {Object} container Container byte source.
 * @param {Object} header Decoded PMTiles header.
 * @param {string} asset Asset name.
 *
 * @returns {Promise<Object>} Validated asset entry.
 *
 * @throws {Error} If metadata does not contain a valid bounded asset.
 */
export async function getCogAssetEntry(container, header, asset) {
  const metadata = JSON.parse(/* alloc */ new TextDecoder().decode(await decompress(
    await readCog(container, header.jsonMetadataOffset, header.jsonMetadataLength), header.internalCompression)));
  const assets = metadata.cog_assets || /* alloc */ {};
  const entry = Object.hasOwn(assets, asset) ? metadata.cog_assets[asset] : null;
  if (metadata.format !== 'cog-assets-v1' || !entry || !Number.isSafeInteger(entry.offset) ||
    !Number.isSafeInteger(entry.length) || entry.offset < 0 || entry.length < 8 ||
    entry.offset + entry.length > header.tileDataLength) {
    throw /* alloc */ new Error(`Invalid or missing PMTiles COG asset: ${asset}`);
  }
  return entry;
}
