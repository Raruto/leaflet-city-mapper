export const vectorTileWorkerUrl = import.meta?.url
  ? new URL('../workers/vectorTileWorker.js', import.meta.url).href
  : new URL('leaflet-city-mapper-vector-worker.js', document.currentScript?.src || document.baseURI).href;
