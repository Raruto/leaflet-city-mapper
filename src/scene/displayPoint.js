export function displayPoint(map, point) {
  return map.layerPointToContainerPoint(point).subtract(map._getMapPanePos());
}
