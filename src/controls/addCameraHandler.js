
import { cameraHandlersByMap } from '../weakmaps/cameraHandlersByMap.js';

/**
 * Register a camera handler and enable it when its map option is set.
 *
 * @param {L.Map} map Map owning the handler.
 * @param {string} name Handler and option name.
 * @param {Function} Type Handler constructor.
 */
export function addCameraHandler(map, name, Type) {
  let handlers = cameraHandlersByMap.get(map);
  if (!handlers) cameraHandlersByMap.set(map, handlers = /* alloc */ new Map());
  const handler = /* alloc */ new Type(map);
  handlers.set(name, handler);
  map._handlers.push(handler);
  if (map.options[name]) handler.enable();
}
