export function validateCogContainer(container, header) {
  if (header.tileType !== 0 || header.tileCompression !== 1 ||
    !Number.isSafeInteger(header.jsonMetadataOffset) || !Number.isSafeInteger(header.jsonMetadataLength) ||
    header.jsonMetadataLength <= 0 || header.jsonMetadataLength > 1048576 ||
    !Number.isSafeInteger(header.tileDataOffset) || !Number.isSafeInteger(header.tileDataLength) ||
    header.tileDataOffset < 127 || header.tileDataOffset + header.tileDataLength > container.size) {
    throw /* alloc */ new Error('Invalid PMTiles COG asset container');
  }
}
