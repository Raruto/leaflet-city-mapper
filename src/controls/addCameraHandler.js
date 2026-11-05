import { cameraByMap } from '../globals/cameraByMap.js';



export function addCameraHandler(map, name, Type) {
  const handler = cameraByMap.get(map)[name] = /* alloc */ new Type(map);
  map._handlers.push(handler);
  if (map.options[name]) handler.enable();
}
