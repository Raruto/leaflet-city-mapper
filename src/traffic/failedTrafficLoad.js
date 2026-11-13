import { failTraffic } from './failTraffic.js';

/**
 * Report traffic loading errors unless the request was cancelled.
 *
 * @param {Object} state Traffic layer state.
 * @param {AbortSignal} signal Signal for the lane request.
 * @param {Error} error Loading failure.
 */
export function failedTrafficLoad(state, signal, error) {
  if (!signal.aborted && error.name !== 'AbortError') failTraffic(state, error);
}
