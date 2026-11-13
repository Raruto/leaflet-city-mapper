import { L } from '../globals/L.js';
import { nativeScalableStyleKeys } from '../globals/nativeScalableStyleKeys.js';

/**
 * Check whether a noninteractive native layer can update its style without rebuilding geometry.
 *
 * @param {string} name Layer method being called.
 * @param {Object} state Native layer state.
 * @param {Array} args Arguments passed to the layer method.
 *
 * @returns {boolean} Whether the style change can be applied by scaling.
 */
export function canScaleNativeStyle(name, state, args) {
  const { source } = state;
  if (name !== 'setStyle' || source.options.interactive !== false || state.dirty && !state.zoomOnly) return false;
  const stroke = state.strokeCoordinates && state.meshes.get('stroke')?.program.uniforms.strokeScale;
  const fill = source instanceof L.Polygon && !source.options.stroke && state.meshes.has('fill');
  if (!stroke && !fill) return false;
  let key;
  if (args[0]) {
    for (key of Object.keys(args[0])) {
      if (!nativeScalableStyleKeys.has(key)) return false;
    }
  }
  return true;
}
