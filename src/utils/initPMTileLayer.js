import { emptyNode } from './emptyNode.js';

export function initPMTileLayer(backend, options) {
  L.Util.setOptions(backend, options);
  backend.root = emptyNode();
  backend._areas = new Map();
  backend._rasterTiles = new Map();
  backend._loadingTiles = 0;
  backend._added = Promise.withResolvers();
  backend.url = new URL(options.url, document.baseURI).href;
  backend._directories = new Map();
  backend.ready = Promise.resolve(backend.options.archive || backend).then(async (archive) => {
    const header = await archive.getHeader();
    backend.options.archive = archive;
    backend.header = header;
    if (backend.options.maxNativeZoom === undefined) {
      backend.options.maxNativeZoom = header.maxZoom;
    }
    backend.options.maxZoom = Math.max(backend.options.minZoom || 0, backend.options.maxZoom);
    backend.fire('ready');
    return backend;
  }).catch(error => {
    backend.fire('error', { error });
    throw error;
  });
}
