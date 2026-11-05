import { failTraffic } from '../lifecycle/failTraffic.js';

export function failedTrafficLoad(state, signal, error) {
  if (!signal.aborted && error.name !== 'AbortError') failTraffic(state, error);
}
