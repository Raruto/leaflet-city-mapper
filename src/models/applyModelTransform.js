import { modelByLayer } from '../weakmaps/modelByLayer.js';


export function applyModelTransform(layer) {
  const model = modelByLayer.get(layer);
  if (layer.options.rotation) {
    const [x, y = x, z = x] = layer.options.rotation;
    model.rotation[0] = x; model.rotation[1] = y; model.rotation[2] = z;
  }
  if (layer.options.scale) {
    const [x, y = x, z = x] = layer.options.scale;
    model.scale[0] = x; model.scale[1] = y; model.scale[2] = z;
  }
}
