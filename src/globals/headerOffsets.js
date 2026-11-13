/**
 * Archive header offset, length and tile count field names in encoded order.
 *
 * @type {Array<string>}
 */
export const headerOffsets = [
  'rootDirectoryOffset', 'rootDirectoryLength', 'jsonMetadataOffset', 'jsonMetadataLength',
  'leafDirectoryOffset', 'leafDirectoryLength', 'tileDataOffset', 'tileDataLength',
  'numAddressedTiles', 'numTileEntries', 'numTileContents',
];
