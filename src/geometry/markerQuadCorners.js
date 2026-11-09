import { cameraByLayer } from '../weakmaps/cameraByLayer.js';
import { rootByLayer } from '../weakmaps/rootByLayer.js';

import { coreMatrixKeys } from '../globals/coreMatrixKeys.js';
import { markerCameraIconPoint } from '../projections/markerCameraIconPoint.js';

import { localPosition } from '../projections/localPosition.js';

import { transformNativePoint } from '../transforms/transformNativePoint.js';
import { markerImageBounds } from './markerImageBounds.js';
import { streamTerrainByMap } from '../weakmaps/streamTerrainByMap.js';
import { mapElevationOf } from '../terrain/mapElevationOf.js';

export function markerQuadCorners(state, key, image) {
  const { source, map, backend: layer } = state;

  const position = localPosition(state, source.getLatLng());
  if (streamTerrainByMap.get(map)) {
    const root = rootByLayer.get(layer), elevation = mapElevationOf(map, source.getLatLng());
    if (Number.isFinite(elevation)) position[1] = (elevation - root.position[1]) / root.scale[1];
  }
  const size = map.getSize();
  const matrices = state.markerMatrices ||= /* alloc */ {
    root: /* alloc */ new DOMMatrix(),
    camera: /* alloc */ new DOMMatrix(),
    point: /* alloc */ { x: 0, y: 0, z: 0, w: 1 },
  };
  const root = matrices.root, camera = matrices.camera, point = matrices.point;
  const worldMatrix = rootByLayer.get(layer).worldMatrix, projection = cameraByLayer.get(layer).projectionViewMatrix;
  let i, keyName;
  for (i = 0; i < 16; i++) {
    keyName = coreMatrixKeys[i];
    root[keyName] = worldMatrix[i];
    camera[keyName] = projection[i];
  }
  transformNativePoint(point, root, position[0], position[1], position[2], 1);
  transformNativePoint(point, camera, point.x, point.y, point.z, point.w);
  const clipX = point.x, clipY = point.y, clipZ = point.z, clipW = point.w;
  camera.invertSelf();
  root.invertSelf();
  const [width, height, anchorX, anchorY] = markerImageBounds(state, key, image);
  const centerX = (clipX / clipW + 1) * size.x / 2, centerY = (1 - clipY / clipW) * size.y / 2;
  const left = centerX - anchorX;
  const top = centerY - anchorY;
  const corners = /* alloc */ [];
  let pointX, pointY, offset, x, y;
  for (i = 0; i < 4; i++) {
    pointX = left + (i % 2 ? width : 0);
    pointY = top + (i < 2 ? 0 : height);
    offset = markerCameraIconPoint(source, pointX - centerX, pointY - centerY);
    x = centerX + offset.x, y = centerY + offset.y;
    transformNativePoint(point, camera, x / size.x * 2 - 1, 1 - y / size.y * 2, clipZ / clipW, 1);
    transformNativePoint(point, root, point.x / point.w, point.y / point.w, point.z / point.w, 1);
    corners.push(/* alloc */ [point.x, point.y, point.z]);
  }
  return corners;
}
