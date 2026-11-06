import { geometryQuaternion } from '../globals/geometryQuaternion.js';
import { geometryScale } from '../globals/geometryScale.js';
import { geometryTranslation } from '../globals/geometryTranslation.js';
/** glTF quaternion/translation/scale to a column-major matrix. */


export function nodeMatrix(spec) {
  if (spec.matrix) return Array.from(spec.matrix);
  // glTF stores quaternions [x,y,z,w]; convert directly to a scaled column-major matrix.
  const [x, y, z, w] = spec.rotation || geometryQuaternion;
  const [sx, sy, sz] = spec.scale || geometryScale;
  return /* alloc */ [
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
    ...(spec.translation || geometryTranslation),
    1,
  ];
}
