import { cameraByMap } from '../globals/cameraByMap.js';


export function trafficNow(state) {
  const control = cameraByMap.get(state.layer._map)?._timeControl;
  const live = control ? control.live : true;
  return /* allocation: required -- Callers may retain a clock snapshot while later updates or callbacks change controls. */ {
    live, time: live ? /* allocation: required -- Each live clock snapshot owns an independently mutable Date. */ new Date() : control.time,
  };
}
