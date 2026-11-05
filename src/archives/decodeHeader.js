import { state as sharedState } from '../state.js';

/** Decode the PMTiles v3 header. */
export function decodeHeader(data) {
  const view = data.byteLength >= 127
    ? /* allocation: required -- This view belongs to the current input buffer. */ new DataView(data) : null;
  // "PMTiles" followed by version 3, read as two little-endian words.
  if (!view || view.getUint32(0, true) !== 0x69544d50 || view.getUint32(4, true) !== 0x0373656c) {
    throw /* allocation: required -- Preserve a fresh stack for each invalid archive. */ new Error('Expected a PMTiles v3 archive');
  }
  const header = /* allocation: required -- Each archive retains its own decoded header. */ {};
  let i;
  for (i = 0; i < sharedState.headerOffsets.length; i++) header[sharedState.headerOffsets[i]] = Number(view.getBigUint64(8 + i * 8, true));
  for (i = 0; i < sharedState.headerFlags.length; i++) header[sharedState.headerFlags[i]] = view.getUint8(96 + i);
  for (i = 0; i < sharedState.headerBounds.length; i++) header[sharedState.headerBounds[i]] = view.getInt32(102 + i * 4, true) / 1e7;
  header.centerZoom = view.getUint8(118);
  header.centerLon = view.getInt32(119, true) / 1e7;
  header.centerLat = view.getInt32(123, true) / 1e7;
  return header;
}
