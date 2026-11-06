import { locationByLayer } from '../weakmaps/locationByLayer.js';




export function getLocation(layer) {
  return locationByLayer.get(layer);
}
