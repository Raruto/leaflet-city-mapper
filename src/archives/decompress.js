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
