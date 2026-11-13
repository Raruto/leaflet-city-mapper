import { sunlightByMap } from '../weakmaps/sunlightByMap.js';
import { atmosphere } from './atmosphere.js';
import { moonPosition } from '../astronomy/moonPosition.js';
import { solarPosition } from '../astronomy/solarPosition.js';
import { render } from './requestSunlightRender.js';
import { updateSky } from './updateSky.js';

/**
 * Update simulation time, solar and lunar positions, sky styling and status.
 *
 * @param {Object} state Sunlight and time-control state.
 */
export function updateSun(state) {
  const { control, map, date, slider, output, status } = state;
  try {
    if (control.live) control.time = /* alloc */ new Date();
    const time = control.time.toISOString();
    date.value = time.slice(0, 10);
    slider.value = String(control.time.getUTCHours() * 60 + control.time.getUTCMinutes());
    output.textContent = `${time.slice(11, 16)} UTC${control.live ? ' · now' : ''}`;
    const center = map.getCenter();
    const sun = solarPosition(control.time, center.lat, center.lng);
    sunlightByMap.set(map, sun);
    Object.assign(sun, atmosphere(sun.altitude));
    sun.moon = moonPosition(control.time, center.lat, center.lng);
    status.textContent = sun.altitude <= 0
      ? 'Night · no direct sunlight'
      : sun.altitude < 3
        ? 'Low sun · shadows paused'
        : `Sun altitude ${sun.altitude.toFixed(1)}°`;
    map.fire('simulationtimechange', /* alloc */ {
      time: /* alloc */ new Date(control.time),
      live: control.live,
    });
    updateSky(state);
    render(map);
  } catch (error) {
    sunlightByMap.delete(map);
    updateSky(state);
    render(map);
    status.textContent = `Error: ${error.message}`;
    console.error('Solar simulation', error);
  }
}
