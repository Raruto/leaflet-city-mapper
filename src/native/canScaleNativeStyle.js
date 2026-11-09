import { L } from '../globals/L.js';
import { nativeScalableStyleKeys } from '../globals/nativeScalableStyleKeys.js';

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
