/**
 * Return uncompressed data or decompress gzip data.
 *
 * @param {ArrayBuffer} data Archive data.
 * @param {number} compression PMTiles compression code.
 *
 * @returns {Promise<ArrayBuffer>} Uncompressed bytes.
 *
 * @throws {Error} If the compression code is unsupported.
 */
export async function decompress(data, compression) {
  if (compression === 1) return data;
  if (compression !== 2) {
    throw /* alloc */ new Error(`Unsupported PMTiles compression: ${compression}`);
  }
  const blob = /* alloc */ new Blob(
    /* alloc */ [data]);
  const stream = /* alloc */ new DecompressionStream('gzip');
  return /* alloc */ new Response(blob.stream().pipeThrough(stream)).arrayBuffer();
}
