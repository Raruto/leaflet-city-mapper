import { render } from './render.js';
import { updateSky } from './updateSky.js';

export function removeSun(state) {
  const { map, timer, sunDisc, moonDisc } = state;
  clearInterval(timer);
  delete map._timeControl;
  map.fire('simulationtimechange', { time: null, live: false });
  map.off('moveend', state.update);
  map.off('move rotate pitch resize', state.updateSky);
  delete map._sunlight;
  updateSky(state);
  sunDisc.remove(); moonDisc.remove();
  render(map);
}
