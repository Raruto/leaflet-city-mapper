import { timeControlByMap } from '../weakmaps/timeControlByMap.js';

import { sunlightByControl } from '../weakmaps/sunlightByControl.js';
import { sunByMap } from '../weakmaps/sunByMap.js';
import { createSun } from './createSun.js';
import { tickSun } from './tickSun.js';

export function onAddSun(control, map) {
  let state = sunByMap.get(map);
  if (state?.control && state.control !== control) {
    control._map = null;
    if (control.layer._map === map) map.removeLayer(control.layer);
    throw /* alloc */ new Error('Only one Time control can be active per map');
  }
  if (!state) {
    state = createSun(map);
    sunByMap.set(map, state);
  }
  state.control = control;
  state.originalSky = map.getContainer().style.getPropertyValue('--leaflet-sky-background');
  timeControlByMap.set(map, control);
  sunlightByControl.set(control, state);
  state.update();
  state.timer = setInterval(tickSun, 60000, state);
  map.on('moveend', state.update);
  map.on('move rotate pitch resize', state.updateSky);
  return state.container;
}
