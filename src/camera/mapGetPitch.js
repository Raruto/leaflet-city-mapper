import { pluginState } from '../core/pluginState.js';
export function mapGetPitch(map) { return pluginState(map)._cameraPitch ?? 0; }
