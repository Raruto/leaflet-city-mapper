import { sceneByLayer } from '../globals/sceneByLayer.js';


export async function read(backend, offset, length, signal) {
  signal?.throwIfAborted();
  if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(length) ||
    offset < 0 || length <= 0 || !Number.isSafeInteger(offset + length)) {
    throw /* alloc */ new Error('Invalid PMTiles byte range');
  }
  const response = await fetch(sceneByLayer.get(backend).url, /* alloc */ {
    headers: /* alloc */ { Range: `bytes=${offset}-${offset + length - 1}` }, signal,
  });
  if (!response.ok) {
    throw /* alloc */ new Error(`Unable to read PMTiles: HTTP ${response.status}`);
  }
  const etag = response.headers.get('ETag');
  if (sceneByLayer.get(backend)._etag && etag !== sceneByLayer.get(backend)._etag) {
    throw /* alloc */ new Error('PMTiles archive changed; recreate the layer');
  }
  if (etag) sceneByLayer.get(backend)._etag = etag;
  let data = await response.arrayBuffer();
  if (response.status === 200) {
    data = data.slice(offset, offset + length);
  } else if (response.status !== 206 ||
    !response.headers.get('Content-Range')?.startsWith(`bytes ${offset}-${offset + length - 1}/`)) {
    throw /* alloc */ new Error('Invalid PMTiles range response');
  }
  if (data.byteLength !== length) {
    throw /* alloc */ new Error('Truncated PMTiles range');
  }
  return data;
}
