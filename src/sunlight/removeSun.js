import { pluginState } from '../core/pluginState.js';
import { render } from './render.js';
import { updateSky } from './updateSky.js';

export function removeSun(state) {
  const { map, timer, sunDisc, moonDisc } = state;
  clearInterval(timer);
  delete pluginState(map)._timeControl;
  map.fire('simulationtimechange', /* allocation: required -- Listeners may retain this control-removal event. */ { time: null, live: false });
  map.off('moveend', state.update);
  map.off('move rotate pitch resize', state.updateSky);
  delete pluginState(map)._sunlight;
  updateSky(state);
  sunDisc.remove(); moonDisc.remove();
  render(map);
}
