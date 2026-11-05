import { pluginState } from '../core/pluginState.js';
export function mapGetBearing(map) { return pluginState(map)._cameraBearing ?? 0; }
