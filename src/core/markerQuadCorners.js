import { markerCameraIconPoint } from './markerCameraIconPoint.js';
import { pluginState } from './pluginState.js';
import { localPosition } from './localPosition.js';
import { state as sharedState } from '../state.js';
import { transformNativePoint } from './transformNativePoint.js';

export function markerQuadCorners(state, key, image) {
  const { source, map, backend } = state;
  const position = localPosition(state, source.getLatLng());
  const options = source.options.icon.options, size = map.getSize();
  const matrices = state.markerMatrices ||= /* allocation: required -- Each native marker owns reusable projection scratch state. */ {
    root: /* allocation: required -- Retain one mutable world matrix per marker rather than per frame. */ new DOMMatrix(),
    camera: /* allocation: required -- Retain one mutable camera matrix per marker rather than per frame. */ new DOMMatrix(),
    point: /* allocation: required -- Retain one homogeneous projection scratch point per marker. */ { x: 0, y: 0, z: 0, w: 1 },
  };
  const root = matrices.root, camera = matrices.camera, point = matrices.point;
  const worldMatrix = pluginState(backend).root.worldMatrix, projection = pluginState(backend).camera.projectionViewMatrix;
  let i, keyName;
  for (i = 0; i < 16; i++) {
    keyName = sharedState.allocationCoreMatrixKeys[i];
    root[keyName] = worldMatrix[i];
    camera[keyName] = projection[i];
  }
  transformNativePoint(point, root, position[0], position[1], position[2], 1);
  transformNativePoint(point, camera, point.x, point.y, point.z, point.w);
  const clipX = point.x, clipY = point.y, clipZ = point.z, clipW = point.w;
  camera.invertSelf();
  root.invertSelf();
  const dimensions = options[key === 'shadow' ? 'shadowSize' : 'iconSize'];
  const width = dimensions ? dimensions.x ?? dimensions[0] : image.naturalWidth;
  const height = dimensions ? dimensions.y ?? dimensions[1] : image.naturalHeight;
  const anchor = (key === 'shadow' && options.shadowAnchor) ||
    options.iconAnchor;
  const centerX = (clipX / clipW + 1) * size.x / 2, centerY = (1 - clipY / clipW) * size.y / 2;
  const left = centerX - (anchor ? anchor.x ?? anchor[0] : Math.floor(width / 2));
  const top = centerY - (anchor ? anchor.y ?? anchor[1] : Math.floor(height / 2));
  const corners = /* allocation: required -- The quad consumer retains independent projected vertex collections. */ [];
  let pointX, pointY, offset, x, y;
  for (i = 0; i < 4; i++) {
    pointX = left + (i % 2 ? width : 0);
    pointY = top + (i < 2 ? 0 : height);
    offset = markerCameraIconPoint(source, pointX - centerX, pointY - centerY);
    x = centerX + offset.x, y = centerY + offset.y;
    transformNativePoint(point, camera, x / size.x * 2 - 1, 1 - y / size.y * 2, clipZ / clipW, 1);
    transformNativePoint(point, root, point.x / point.w, point.y / point.w, point.z / point.w, 1);
    corners.push(/* allocation: required -- Returned vertices must not alias each other or the reusable scratch point. */ [point.x, point.y, point.z]);
  }
  return corners;
}
