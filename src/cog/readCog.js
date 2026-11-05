export async function readCog(source, offset, length, signal) {
  signal?.throwIfAborted();
  if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(length) || offset < 0 ||
    length <= 0 || length > 32000000 || !Number.isSafeInteger(offset + length) ||
    source.size !== undefined && offset + length > source.size) {
    throw /* alloc */ new Error('Invalid COG byte range');
  }
  if (source.full) return source.full.slice(offset, offset + length);
  const rangeStart = (source.baseOffset || 0) + offset;
  const response = await fetch(source.url, /* alloc */ {
    headers: /* alloc */ { Range: `bytes=${rangeStart}-${rangeStart + length - 1}` }, signal,
  });
  if (!response.ok) throw /* alloc */ new Error(`Unable to read COG: HTTP ${response.status}`);
  const etag = response.headers.get('ETag');
  if (source.etag && source.etag !== etag) throw /* alloc */ new Error('COG changed; recreate the layer');
  if (etag) source.etag = etag;
  const range = /^bytes (\d+)-(\d+)\/(\d+)$/.exec(response.headers.get('Content-Range') || '');
  if (response.status === 206) {
    if (!range || Number(range[1]) !== rangeStart || Number(range[2]) !== rangeStart + length - 1 ||
      !Number.isSafeInteger(Number(range[3])) || Number(range[3]) < rangeStart + length ||
      (source.containerSize ?? source.size) !== undefined && (source.containerSize ?? source.size) !== Number(range[3])) {
      throw /* alloc */ new Error('Invalid COG range response');
    }
    if (source.baseOffset === undefined) source.size = Number(range[3]);
  } else if (response.status !== 200 || Number(response.headers.get('Content-Length')) > 32000000) {
    throw /* alloc */ new Error('COG server must support byte ranges for files over 32 MB');
  }
  const reader = response.body.getReader(), chunks = /* alloc */ [];
  let total = 0, part;
  try {
    while (!(part = await reader.read()).done) {
      total += part.value.byteLength;
      if (total > (response.status === 206 ? length : 32000000)) {
        await reader.cancel();
        throw /* alloc */ new Error('Oversized COG response');
      }
      chunks.push(part.value);
    }
  } finally {
    reader.releaseLock();
  }
  const data = /* alloc */ new Uint8Array(total);
  let start = 0, chunk;
  for (chunk of chunks) { data.set(chunk, start); start += chunk.length; }
  if (response.status === 200) {
    if (source.baseOffset === undefined) source.size = total;
    else if (total !== source.containerSize) throw /* alloc */ new Error('Truncated PMTiles COG container');
    source.full = source.baseOffset === undefined ? data.buffer
      : data.buffer.slice(source.baseOffset, source.baseOffset + source.size);
  }
  const result = response.status === 200 ? source.full.slice(offset, offset + length) : data.buffer;
  if (result.byteLength !== length) throw /* alloc */ new Error('Truncated COG byte range');
  return result;
}
