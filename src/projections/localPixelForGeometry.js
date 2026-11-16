import { geometryPixelStates } from '../globals/geometryPixelStates.js';
import { localPixel } from './localPixel.js';
import { mapElevationOf } from '../terrain/mapElevationOf.js';
import { rootByLayer } from '../weakmaps/rootByLayer.js';
import { streamTerrainByMap } from '../weakmaps/streamTerrainByMap.js';
import { terrain3DByMap } from '../weakmaps/terrain3DByMap.js';

/**
 * Project a geometry point and optionally record its stroke anchor in the active pixel projection.
 *
 * @param {L.Point} point Geometry pixel.
 * @param {L.Point} [anchor] Optional stroke anchor.
 *
 * @returns {number[]} Local coordinates as [x, height, z].
 */
export function localPixelForGeometry(point, anchor) {
  const state = geometryPixelStates[geometryPixelStates.length - 1];
  const result = localPixel(state, point), origin = anchor || point;
  const elevation = streamTerrainByMap.get(state.map) || terrain3DByMap.get(state.map)
    ? mapElevationOf(state.map, state.map.unproject(origin)) : null;
  const root = rootByLayer.get(state.backend);
  if (Number.isFinite(elevation) && root) result[1] = (elevation - root.position[1] + 1) / root.scale[1];
  if (anchor && state.strokeAnchors) {
    const projected = localPixel(state, anchor);
    projected[1] = result[1];
    state.strokeAnchors.push(...projected);
  }
  return result;
}
