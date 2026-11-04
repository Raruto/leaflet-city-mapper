/** Decode the PMTiles v3 header. */

export function decodeHeader(data) {
  if (data.byteLength < 127 || new TextDecoder().decode(new Uint8Array(data, 0, 7)) !== 'PMTiles' ||
    new Uint8Array(data)[7] !== 3) throw new Error('Expected a PMTiles v3 archive');
  const view = new DataView(data);
  const header = {};
  ['rootDirectoryOffset', 'rootDirectoryLength', 'jsonMetadataOffset', 'jsonMetadataLength', 'leafDirectoryOffset', 'leafDirectoryLength', 'tileDataOffset', 'tileDataLength', 'numAddressedTiles', 'numTileEntries', 'numTileContents'].forEach((name, i) => { header[name] = Number(view.getBigUint64(8 + i * 8, true)); });
  ['clustered', 'internalCompression', 'tileCompression', 'tileType', 'minZoom', 'maxZoom'].forEach((name, i) => { header[name] = view.getUint8(96 + i); });
  ['minLon', 'minLat', 'maxLon', 'maxLat'].forEach((name, i) => { header[name] = view.getInt32(102 + i * 4, true) / 1e7; });
  header.centerZoom = view.getUint8(118);
  header.centerLon = view.getInt32(119, true) / 1e7;
  header.centerLat = view.getInt32(123, true) / 1e7;
  return header;
}
