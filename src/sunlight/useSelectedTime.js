import { render } from './render.js';
import { updateSky } from './updateSky.js';
import { updateSun } from './updateSun.js';

export function useSelectedTime(state) {
  const { control, map, date, slider, status } = state;
  control.live = false;
  if (!date.value || !date.validity.valid) {
    control.time = new Date(NaN);
    map.fire('simulationtimechange', { time: null, live: false });
    delete map._sunlight;
    updateSky(state);
    render(map);
    status.textContent = 'Error: choose a valid solar date';
    return;
  }
  control.time = new Date(`${date.value}T00:00:00Z`);
  control.time.setUTCMinutes(Number(slider.value));
  updateSun(state);
}
