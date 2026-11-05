import { pluginState } from '../core/pluginState.js';
import { render } from './render.js';
import { updateSky } from './updateSky.js';
import { updateSun } from './updateSun.js';

export function useSelectedTime(state) {
  const { control, map, date, slider, status } = state;
  control.live = false;
  if (!date.value || !date.validity.valid) {
    control.time = /* allocation: required -- Invalid selection state belongs only to this control. */ new Date(NaN);
    map.fire('simulationtimechange', /* allocation: required -- Listeners may retain the invalid-selection event. */ { time: null, live: false });
    delete pluginState(map)._sunlight;
    updateSky(state);
    render(map);
    status.textContent = 'Error: choose a valid solar date';
    return;
  }
  control.time = /* allocation: required -- Each selection owns a date independent of prior selections and events. */ new Date(`${date.value}T00:00:00Z`);
  control.time.setUTCMinutes(Number(slider.value));
  updateSun(state);
}
