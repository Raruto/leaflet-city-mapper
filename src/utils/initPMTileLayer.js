import { update as updateScene } from './update.js';

export function initPMTileLayer(backend, options) {
  L.TileLayer.prototype.initialize.call(backend, options.url, options);
  backend.url = new URL(options.url, document.baseURI).href;
  backend._directories = new Map();
  backend.on('tileunload', backend._releaseTile, backend);
  backend.on('load tileunload', () => {
    const renderer = L.Layer.types['3d']._renderers.get(backend._map);
    if (renderer) updateScene(renderer);
  });
  backend.ready = Promise.resolve(backend.options.archive || backend).then(async (archive) => {
    const header = await archive.getHeader();
    backend.options.archive = archive;
    backend.header = header;
    if (backend.options.maxNativeZoom === undefined) {
      backend.options.maxNativeZoom = header.maxZoom;
    }
    backend.fire('ready');
    return backend;
  }).catch(error => {
    backend.fire('error', { error });
    throw error;
  });
}
