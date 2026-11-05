import { cameraByMap } from '../globals/cameraByMap.js';


import { render } from './render.js';
import { updateSky } from './updateSky.js';

export function removeSun(state) {
  const { map, timer, sunDisc, moonDisc } = state;
  clearInterval(timer);
  delete cameraByMap.get(map)._timeControl;
  map.fire('simulationtimechange', /* alloc */ { time: null, live: false });
  map.off('moveend', state.update);
  map.off('move rotate pitch resize', state.updateSky);
  delete cameraByMap.get(map)._sunlight;
  updateSky(state);
  sunDisc.remove(); moonDisc.remove();
  render(map);
}
