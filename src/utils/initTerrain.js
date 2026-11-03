export function initTerrain(backend, options = {}) {
  const terrainSource = options.url;
  const layerOptions = { ...options };
  delete layerOptions.url;
  L.Layer.types['3d'].prototype.initialize.call(backend, layerOptions);
  backend.terrainSource = terrainSource;
  backend._terrainTiles = new Map();
  backend._rasterTiles = new Map();
  backend._terrainReady = false;
}
