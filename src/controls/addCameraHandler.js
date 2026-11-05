import { cameraByMap } from '../globals/cameraByMap.js';



export function addCameraHandler(map, name, Type) {
  const handler = cameraByMap.get(map)[name] = /* allocation: required -- Each map retains and toggles its own handler instance. */ new Type(map);
  map._handlers.push(handler);
  if (map.options[name]) handler.enable();
}
