/**
 * Default URL of the geometry worker for module and bundled builds.
 *
 * @type {string}
 */
export const geometryWorkerUrl = import.meta?.url
  ? new URL('../workers/geometryWorker.js', import.meta.url).href
  : new URL('leaflet-city-mapper-worker.js', document.currentScript?.src || document.baseURI).href;
