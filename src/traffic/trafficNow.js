import { timeControlByMap } from '../weakmaps/timeControlByMap.js';



export function trafficNow(state) {
  const control = timeControlByMap.get(state.layer._map);
  const live = control ? control.live : true;
  return /* alloc */ {
    live, time: live ? /* alloc */ new Date() : control.time,
  };
}
