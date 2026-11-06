
import { cameraHandlersByMap } from '../weakmaps/cameraHandlersByMap.js';

export function addCameraHandler(map, name, Type) {
  let handlers = cameraHandlersByMap.get(map);
  if (!handlers) cameraHandlersByMap.set(map, handlers = /* alloc */ new Map());
  const handler = /* alloc */ new Type(map);
  handlers.set(name, handler);
  map._handlers.push(handler);
  if (map.options[name]) handler.enable();
}
