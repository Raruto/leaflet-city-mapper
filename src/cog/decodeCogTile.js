/**
 * Decode an uncompressed or deflate-compressed COG tile to its expected byte length.
 *
 * @param {ArrayBuffer} data Encoded tile data.
 * @param {number} length Expected decoded byte length.
 * @param {number} compression TIFF compression code.
 *
 * @returns {Promise<ArrayBuffer>} Decoded tile data.
 *
 * @throws {Error} If an uncompressed tile has the wrong size.
 * @throws {Error} If decompressed data exceeds the expected size.
 * @throws {Error} If decompressed data is shorter than expected.
 */
export async function decodeCogTile(data, length, compression) {
  if (compression === 1) {
    if (data.byteLength !== length) throw /* alloc */ new Error('Invalid uncompressed COG tile size');
    return data;
  }
  const stream = /* alloc */ new Blob(/* alloc */ [data]).stream()
    .pipeThrough(/* alloc */ new DecompressionStream('deflate'));
  const reader = stream.getReader(), result = /* alloc */ new Uint8Array(length);
  let offset = 0, chunk;
  try {
    while (!(chunk = await reader.read()).done) {
      if (offset + chunk.value.length > length) {
        await reader.cancel();
        throw /* alloc */ new Error('Oversized decoded COG tile');
      }
      result.set(chunk.value, offset);
      offset += chunk.value.length;
    }
  } finally {
    reader.releaseLock();
  }
  if (offset !== length) throw /* alloc */ new Error('Truncated decoded COG tile');
  return result.buffer;
}
