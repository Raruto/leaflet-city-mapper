import { headerOffsets } from '../globals/headerOffsets.js';
import { headerFlags } from '../globals/headerFlags.js';
import { headerBounds } from '../globals/headerBounds.js';

/**
 * Decode the PMTiles v3 header.
 *
 * @param {ArrayBuffer} data Header bytes.
 *
 * @returns {Object} Archive offsets, flags, bounds and center.
 *
 * @throws {Error} If the header is too short or not PMTiles version 3.
 */
export function decodeHeader(data) {
  const view = data.byteLength >= 127
    ? /* alloc */ new DataView(data) : null;
  // "PMTiles" followed by version 3, read as two little-endian words.
  if (!view || view.getUint32(0, true) !== 0x69544d50 || view.getUint32(4, true) !== 0x0373656c) {
    throw /* alloc */ new Error('Expected a PMTiles v3 archive');
  }
  const header = /* alloc */ {};
  let i;
  for (i = 0; i < headerOffsets.length; i++) header[headerOffsets[i]] = Number(view.getBigUint64(8 + i * 8, true));
  for (i = 0; i < headerFlags.length; i++) header[headerFlags[i]] = view.getUint8(96 + i);
  for (i = 0; i < headerBounds.length; i++) header[headerBounds[i]] = view.getInt32(102 + i * 4, true) / 1e7;
  header.centerZoom = view.getUint8(118);
  header.centerLon = view.getInt32(119, true) / 1e7;
  header.centerLat = view.getInt32(123, true) / 1e7;
  return header;
}
