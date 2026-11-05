import { notifyCameraTouchChange } from '../controls/notifyCameraTouchChange.js';

export const TouchMode = L.Handler.extend({
  addHooks: notifyCameraTouchChange,
  removeHooks: notifyCameraTouchChange,
});
