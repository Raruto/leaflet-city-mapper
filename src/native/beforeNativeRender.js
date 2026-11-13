import { synchronizeNativeLayer } from './synchronizeNativeLayer.js';
import { cameraViewByMap } from '../weakmaps/cameraViewByMap.js';

/**
 * Synchronize a native layer and adjust its stroke scale before rendering.
 *
 * @param {Object} state Native layer state.
 */
export function beforeNativeRender(state) {
  try {
    synchronizeNativeLayer(state);
    const uniform = state.meshes.get('stroke')?.program.uniforms.strokeScale;
    if (uniform) {
      const zoom = cameraViewByMap.get(state.map)?.zoom ?? state.map.getZoom();
      uniform.value = 2 ** (state.strokeZoom - zoom) * Number(state.source.options.weight) / state.strokeWeight;
    }
  } catch (error) {
    state.failed = true;
    state.source.fire('error', /* alloc */ { error });
  }
}
