export async function read(backend, offset, length, signal) {
  signal?.throwIfAborted();
  if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(length) ||
    offset < 0 || length <= 0 || !Number.isSafeInteger(offset + length)) {
    throw new Error('Invalid PMTiles byte range');
  }
  const response = await fetch(backend.url, {
    headers: { Range: `bytes=${offset}-${offset + length - 1}` }, signal,
  });
  if (!response.ok) {
    throw new Error(`Unable to read PMTiles: HTTP ${response.status}`);
  }
  const etag = response.headers.get('ETag');
  if (backend._etag && etag !== backend._etag) {
    throw new Error('PMTiles archive changed; recreate the layer');
  }
  if (etag) backend._etag = etag;
  let data = await response.arrayBuffer();
  if (response.status === 200) {
    data = data.slice(offset, offset + length);
  } else if (response.status !== 206 ||
    !response.headers.get('Content-Range')?.startsWith(`bytes ${offset}-${offset + length - 1}/`)) {
    throw new Error('Invalid PMTiles range response');
  }
  if (data.byteLength !== length) {
    throw new Error('Truncated PMTiles range');
  }
  return data;
}
