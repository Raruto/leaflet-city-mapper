export function setTerrainHeight(layer) {
  if (!layer.root || !layer.location) return;
  layer._terrainBaseY ??= layer.root.position[1];
  const terrain = layer._map?._terrain3D;
  const elevation = terrain?._getElevation(layer.location);
  layer.root.position[1] = layer._terrainBaseY + (elevation ?? 0) +
    (terrain && elevation !== null ? layer.options.terrainOffset ?? 0 : 0);
}
