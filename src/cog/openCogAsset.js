import { decodeHeader } from '../archives/decodeHeader.js';
import { decompress } from '../archives/decompress.js';
import { readCog } from './readCog.js';

export async function openCogAsset(url, asset) {
  const container = /* alloc */ { url };
  const header = decodeHeader(await readCog(container, 0, 127));
  if (header.tileType !== 0 || header.tileCompression !== 1 ||
    !Number.isSafeInteger(header.jsonMetadataOffset) || !Number.isSafeInteger(header.jsonMetadataLength) ||
    header.jsonMetadataLength <= 0 || header.jsonMetadataLength > 1048576 ||
    !Number.isSafeInteger(header.tileDataOffset) || !Number.isSafeInteger(header.tileDataLength) ||
    header.tileDataOffset < 127 || header.tileDataOffset + header.tileDataLength > container.size) {
    throw /* alloc */ new Error('Invalid PMTiles COG asset container');
  }
  const metadata = JSON.parse(/* alloc */ new TextDecoder().decode(await decompress(
    await readCog(container, header.jsonMetadataOffset, header.jsonMetadataLength), header.internalCompression)));
  const entry = Object.hasOwn(metadata.cog_assets || /* alloc */ {}, asset) ? metadata.cog_assets[asset] : null;
  if (metadata.format !== 'cog-assets-v1' || !entry || !Number.isSafeInteger(entry.offset) ||
    !Number.isSafeInteger(entry.length) || entry.offset < 0 || entry.length < 8 ||
    entry.offset + entry.length > header.tileDataLength) {
    throw /* alloc */ new Error(`Invalid or missing PMTiles COG asset: ${asset}`);
  }
  const baseOffset = header.tileDataOffset + entry.offset;
  return /* alloc */ { url, baseOffset, size: entry.length, containerSize: container.size,
    etag: container.etag, full: container.full?.slice(baseOffset, baseOffset + entry.length) };
}
