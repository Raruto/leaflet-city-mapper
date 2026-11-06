import { controlByLayer } from '../weakmaps/controlByLayer.js';



export function addTimeLayer(map) {
  return controlByLayer.get(this).addTo(map);
}
