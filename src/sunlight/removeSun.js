import { sunlightByMap } from '../weakmaps/sunlightByMap.js';
import { timeControlByMap } from '../weakmaps/timeControlByMap.js';

import { sunByMap } from '../weakmaps/sunByMap.js';


import { render } from './render.js';
import { updateSky } from './updateSky.js';

export function removeSun(state) {
  const { map, timer, sunDisc, moonDisc } = state;
  const shared = sunByMap.get(map);
  clearInterval(timer);
  timeControlByMap.delete(map);
  map.fire('simulationtimechange', /* alloc */ { time: null, live: false });
  map.off('moveend', state.update);
  map.off('move rotate pitch resize', state.updateSky);
  sunlightByMap.delete(map);
  updateSky(state);
  sunDisc.remove(); moonDisc.remove();
  render(map);
  if (shared === state) shared.control = null;
}
