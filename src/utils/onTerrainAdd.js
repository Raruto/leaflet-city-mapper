export function onTerrainAdd(backend, map) {
  if (map._terrain3D && map._terrain3D !== backend) {
    throw new Error('Only one terrain layer can be active per map');
  }
  map._terrain3D = backend;
  L.Layer.types['3d'].prototype.onAdd.call(backend, map);
  backend._terrainPromise = backend.root
    ? backend._loadTerrain()
    : new Promise(resolve => backend.once('ready', () => backend._loadTerrain().then(resolve), backend));
  map.eachLayer(layer => layer._setTerrain3D?.(backend));
  map.fire('terrainchange');
}
