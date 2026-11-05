export async function decompress(data, compression) {
  if (compression === 1) return data;
  if (compression !== 2) {
    throw /* allocation: required -- Preserve the stack and compression of this failed decode. */ new Error(`Unsupported PMTiles compression: ${compression}`);
  }
  const blob = /* allocation: required -- Each decompression reads its own immutable compressed bytes. */ new Blob(
    /* allocation: required -- Blob requires an iterable of this request's input parts. */ [data]);
  const stream = /* allocation: required -- Concurrent decompressions need independent stream state. */ new DecompressionStream('gzip');
  return /* allocation: required -- Each response consumes only this decompressed stream. */ new Response(blob.stream().pipeThrough(stream)).arrayBuffer();
}
