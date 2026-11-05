import { pluginState } from '../core/pluginState.js';
import * as attach from './attach.js';

export async function attachLayer(backend, map) {
  try {
    await attach.attach(backend, map);
    pluginState(backend)._added.resolve();
  } catch (error) {
    backend.fire('error', /* allocation: required -- Preserve an independent error event for this layer. */ { error });
  }
}
