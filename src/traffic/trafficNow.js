import { cameraByMap } from '../globals/cameraByMap.js';


export function trafficNow(state) {
  const control = cameraByMap.get(state.layer._map)?._timeControl;
  const live = control ? control.live : true;
  return /* alloc */ {
    live, time: live ? /* alloc */ new Date() : control.time,
  };
}
