import { decodeHeader } from '../archives/decodeHeader.js';
import { readCog } from './readCog.js';
import { validateCogContainer } from './validateCogContainer.js';
import { getCogAssetEntry } from './getCogAssetEntry.js';

/**
 * Open a named COG asset within a PMTiles container as a bounded byte source.
 *
 * @param {string} url Container URL.
 * @param {string} asset Asset name.
 *
 * @returns {Promise<Object>} COG source with container offset and size.
 */
export async function openCogAsset(url, asset) {
  const container = /* alloc */ { url };
  const header = decodeHeader(await readCog(container, 0, 127));
  validateCogContainer(container, header);
  const entry = await getCogAssetEntry(container, header, asset);
  const baseOffset = header.tileDataOffset + entry.offset;
  return /* alloc */ { url, baseOffset, size: entry.length, containerSize: container.size,
    etag: container.etag, full: container.full?.slice(baseOffset, baseOffset + entry.length) };
}
