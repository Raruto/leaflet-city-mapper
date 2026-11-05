import { sceneByLayer } from '../globals/sceneByLayer.js';


export async function read(backend, offset, length, signal) {
  signal?.throwIfAborted();
  if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(length) ||
    offset < 0 || length <= 0 || !Number.isSafeInteger(offset + length)) {
    throw /* allocation: required -- Preserve the stack of this invalid byte range. */ new Error('Invalid PMTiles byte range');
  }
  const response = await fetch(sceneByLayer.get(backend).url, /* allocation: required -- Concurrent fetches need independent ranges and abort signals. */ {
    headers: /* allocation: required -- Each request owns its byte range header. */ { Range: `bytes=${offset}-${offset + length - 1}` }, signal,
  });
  if (!response.ok) {
    throw /* allocation: required -- Preserve the stack and status of this failed request. */ new Error(`Unable to read PMTiles: HTTP ${response.status}`);
  }
  const etag = response.headers.get('ETag');
  if (sceneByLayer.get(backend)._etag && etag !== sceneByLayer.get(backend)._etag) {
    throw /* allocation: required -- Identify the request that detected an archive change. */ new Error('PMTiles archive changed; recreate the layer');
  }
  if (etag) sceneByLayer.get(backend)._etag = etag;
  let data = await response.arrayBuffer();
  if (response.status === 200) {
    data = data.slice(offset, offset + length);
  } else if (response.status !== 206 ||
    !response.headers.get('Content-Range')?.startsWith(`bytes ${offset}-${offset + length - 1}/`)) {
    throw /* allocation: required -- Preserve the stack of this invalid range response. */ new Error('Invalid PMTiles range response');
  }
  if (data.byteLength !== length) {
    throw /* allocation: required -- Preserve the stack of this truncated response. */ new Error('Truncated PMTiles range');
  }
  return data;
}
