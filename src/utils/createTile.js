export function createTile(backend, coords, done) {
  const tile = document.createElement('img');
  tile.alt = '';
  if (backend.options.crossOrigin || backend.options.crossOrigin === '') {
    tile.crossOrigin = backend.options.crossOrigin === true ? '' : backend.options.crossOrigin;
  }
  if (typeof backend.options.referrerPolicy === 'string') tile.referrerPolicy = backend.options.referrerPolicy;
  tile.request = new AbortController();
  backend.ready.then(() => {
    if (tile.request.signal.aborted) return;
    return backend.options.archive.getZxy(coords.z, coords.x, coords.y, tile.request.signal);
  }).then(async (result) => {
    if (tile.request.signal.aborted) return;
    if (!result) throw new Error(`Tile ${coords.z}/${coords.x}/${coords.y} is not in the offline archive`);
    await new Promise((resolve, reject) => {
      const finish = error => {
        tile.request.signal.removeEventListener('abort', abort);
        tile.onload = tile.onerror = null;
        backend._releaseURL(tile);
        if (error) reject(error);
        else resolve();
      };
      const abort = () => finish();
      tile.request.signal.addEventListener('abort', abort, { once: true });
      tile.objectURL = URL.createObjectURL(new Blob([result.data]));
      tile.onload = () => finish();
      tile.onerror = () => finish(new Error(`Unable to decode tile ${coords.z}/${coords.x}/${coords.y}`));
      tile.src = tile.objectURL;
    });
    if (tile.request.signal.aborted) return;
    tile.done = true;
    backend._registerTerrainTile(coords, tile);
    done(null, tile);
  }).catch(error => {
    if (tile.request.signal.aborted) return;
    tile.error = error.message;
    backend._tileOnError(done, tile, error);
  });
  return tile;
}
