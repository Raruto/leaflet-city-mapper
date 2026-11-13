import { refreshRotateControl } from './refreshRotateControl.js';

/** Refresh the rotate control associated with this button after focus changes. */
export function refreshRotateFocus() {
  refreshRotateControl.call(this._rotateControl);
}
