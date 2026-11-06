import { synchronizeNativeLayer } from './synchronizeNativeLayer.js';

export function beforeNativeRender(state) {
  try {
    synchronizeNativeLayer(state);
  } catch (error) {
    state.failed = true;
    state.source.fire('error', /* alloc */ { error });
  }
}
