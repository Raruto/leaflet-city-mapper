export async function decompress(data, compression) {
  if (compression === 1) return data;
  if (compression !== 2) throw new Error(`Unsupported PMTiles compression: ${compression}`);
  return new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
}
