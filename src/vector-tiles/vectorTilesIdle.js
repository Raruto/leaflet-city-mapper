export function vectorTilesIdle(layer, session) {
  return layer.session === session && performance.now() - (layer.changedAt || 0) >= 180;
}
