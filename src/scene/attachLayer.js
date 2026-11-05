import { sceneByLayer } from '../globals/sceneByLayer.js';


import * as attach from './attach.js';

export async function attachLayer(backend, map) {
  try {
    await attach.attach(backend, map);
    sceneByLayer.get(backend)._added.resolve();
  } catch (error) {
    backend.fire('error', /* alloc */ { error });
  }
}
