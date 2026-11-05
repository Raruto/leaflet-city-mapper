import { cameraByMap } from '../globals/cameraByMap.js';


import { render } from './render.js';
import { updateSky } from './updateSky.js';
import { updateSun } from './updateSun.js';

export function useSelectedTime(state) {
  const { control, map, date, slider, status } = state;
  control.live = false;
  if (!date.value || !date.validity.valid) {
    control.time = /* alloc */ new Date(NaN);
    map.fire('simulationtimechange', /* alloc */ { time: null, live: false });
    delete cameraByMap.get(map)._sunlight;
    updateSky(state);
    render(map);
    status.textContent = 'Error: choose a valid solar date';
    return;
  }
  control.time = /* alloc */ new Date(`${date.value}T00:00:00Z`);
  control.time.setUTCMinutes(Number(slider.value));
  updateSun(state);
}
