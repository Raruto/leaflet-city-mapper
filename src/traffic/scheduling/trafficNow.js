export function trafficNow(state) {
  const control = state.layer._map?._timeControl || { live: true };
  return { live: control.live, time: control.live ? new Date() : control.time };
}
