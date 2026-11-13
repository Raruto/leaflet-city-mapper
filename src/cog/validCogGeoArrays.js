import { finiteCogValues } from './finiteCogValues.js';

/**
 * Validate the structure and numeric values of GeoTIFF key, pixel scale and tiepoint arrays.
 *
 * @param {Array<number>} keys GeoKey directory.
 * @param {Array<number>} scale Pixel scale values.
 * @param {Array<number>} tie Tiepoint values.
 *
 * @returns {boolean} Whether the arrays describe a supported north-up grid.
 */
export function validCogGeoArrays(keys, scale, tie) {
  return !!keys && keys[0] === 1 && keys.length === 4 + keys[3] * 4 &&
    !!scale && scale.length === 3 && finiteCogValues(scale) &&
    scale[0] > 0 && Math.abs(scale[0] - scale[1]) <= 1e-8 &&
    !!tie && tie.length === 6 && finiteCogValues(tie) && tie[0] === 0 && tie[1] === 0;
}
