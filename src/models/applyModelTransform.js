import { sceneByLayer } from '../globals/sceneByLayer.js';

export function applyModelTransform(backend) {
  const model = sceneByLayer.get(backend).model;
  if (backend.options.rotation) {
    const [x, y = x, z = x] = backend.options.rotation;
    model.rotation[0] = x; model.rotation[1] = y; model.rotation[2] = z;
  }
  if (backend.options.scale) {
    const [x, y = x, z = x] = backend.options.scale;
    model.scale[0] = x; model.scale[1] = y; model.scale[2] = z;
  }
}
