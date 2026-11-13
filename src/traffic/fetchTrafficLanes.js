/**
 * Load time-dependent lanes from a JS module or fetch and cache a static GeoJSON response.
 *
 * @param {Object} state Traffic layer state.
 * @param {Date} time Current simulation time.
 * @param {AbortSignal} signal Signal for cancelling the request.
 *
 * @returns {Promise<Object>} The loaded GeoJSON data.
 *
 * @throws {Error} If the static data request returns a non-success status.
 */
export async function fetchTrafficLanes(state, time, signal) {
  const href = /* alloc */ new URL(state.url, document.baseURI).href;
  if (/\.m?js(?:[?#]|$)/i.test(state.url)) return (await import(href)).default(time, state.layer, signal);
  if (!state.file) {
    const response = await fetch(href, /* alloc */ { signal });
    if (!response.ok) throw /* alloc */ new Error(`HTTP ${response.status}`);
    state.file = await response.json();
  }
  return state.file;
}
