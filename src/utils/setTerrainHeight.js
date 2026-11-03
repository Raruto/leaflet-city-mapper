export function setTerrainHeight(layer) {
  if (!layer.root || !layer.location) return;
  layer._terrainBaseY ??= layer.root.position[1];
  layer.root.position[1] = layer._terrainBaseY + (layer._map?._terrain3D?._getElevation(layer.location) ?? 0);
}
