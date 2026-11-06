import { addedByLayer } from '../weakmaps/addedByLayer.js';



import * as attach from './attachSharedScene.js';

export async function attachLayer(layer, map) {
  try {
    await attach.attach(layer, map);
    addedByLayer.get(layer).resolve();
  } catch (error) {
    layer.fire('error', /* alloc */ { error });
  }
}
