import * as attach from './attach.js';

export async function attachLayer(backend, map) {
  try {
    await attach.attach(backend, map);
    backend._added.resolve();
  } catch (error) {
    backend.fire('error', { error });
  }
}
