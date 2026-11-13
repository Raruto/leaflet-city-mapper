import { L } from '../globals/L.js';
import { pathProjectionByMap } from '../weakmaps/pathProjectionByMap.js';

/**
 * Project a native path using a temporary renderer view when required by Leaflet 2.
 *
 * @param {L.Path} source Path to project.
 *
 * @returns {*} Original projection result on Leaflet 1.
 */
export function projectNativePath(source) {
  if (!L.version.startsWith('2.')) return source._project();
  const map = source._map, renderer = source._renderer;
  let projection = pathProjectionByMap.get(map);
  if (!projection) {
    // Leaflet 2 projects against a renderer view, even when no DOM renderer is mounted.
    projection = Object.create(L.Renderer.prototype);
    projection._map = map;
    pathProjectionByMap.set(map, projection);
  }
  projection._pathZoom = map.getZoom();
  projection._pathOrigin = map.getPixelOrigin();
  source._renderer = projection;
  try {
    source._project();
  } finally {
    if (renderer) source._renderer = renderer;
    else delete source._renderer;
  }
}
