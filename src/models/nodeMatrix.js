/** glTF quaternion/translation/scale to a column-major matrix. */
import { state as sharedState } from '../state.js';

export function nodeMatrix(spec) {
  if (spec.matrix) return Array.from(spec.matrix);
  // glTF stores quaternions [x,y,z,w]; convert directly to a scaled column-major matrix.
  const [x, y, z, w] = spec.rotation || sharedState.allocationGeometryQuaternion;
  const [sx, sy, sz] = spec.scale || sharedState.allocationGeometryScale;
  return /* allocation: required -- Each model node retains its independently editable local transform. */ [
    (1 - 2 * (y * y + z * z)) * sx,
    2 * (x * y + z * w) * sx,
    2 * (x * z - y * w) * sx,
    0,
    2 * (x * y - z * w) * sy,
    (1 - 2 * (x * x + z * z)) * sy,
    2 * (y * z + x * w) * sy, 0,
    2 * (x * z + y * w) * sz,
    2 * (y * z - x * w) * sz,
    (1 - 2 * (x * x + y * y)) * sz,
    0,
    ...(spec.translation || sharedState.allocationGeometryTranslation),
    1,
  ];
}
