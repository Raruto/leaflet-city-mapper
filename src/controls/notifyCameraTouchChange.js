/** Notify this handler's map that its camera touch configuration changed. */
export function notifyCameraTouchChange() { this._map.fire('cameratouchchange'); }
