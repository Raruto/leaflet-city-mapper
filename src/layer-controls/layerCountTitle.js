import { modelUrlByLayer } from '../weakmaps/modelUrlByLayer.js';

export function layerCountTitle(layer, formatted, pending, error) {
  return error ? `Unable to load: ${typeof error === 'string' ? error : error.message}` :
    `${formatted} loaded ${modelUrlByLayer.get(layer) ? 'models' : 'elements'} in the current area${pending ? `; ${pending} blocks loading` : ''}`;
}
