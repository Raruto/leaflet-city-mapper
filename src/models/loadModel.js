import { addedByLayer } from '../weakmaps/addedByLayer.js';
import { modelByLayer } from '../weakmaps/modelByLayer.js';
import { modelUrlByLayer } from '../weakmaps/modelUrlByLayer.js';
import { rootByLayer } from '../weakmaps/rootByLayer.js';
import { terrain3DByMap } from '../weakmaps/terrain3DByMap.js';
import { cameraViewByMap } from '../weakmaps/cameraViewByMap.js';
import { runSourceWorker } from '../workers/runSourceWorker.js';
import { setParent } from '../scene/setParent.js';
import { emptyNode } from '../scene/createSceneNode.js';
import { conformModelToTerrain } from '../geometry/conformModelToTerrain.js';
import { createModelContext } from './createModelContext.js';
import { buildModelNodes } from './buildModelNodes.js';
import { applyModelTransform } from './applyModelTransform.js';

/**
 * Load the configured static GLB/glTF model, attach it to the layer and conform it to terrain.
 *
 * @param {L.Layer} layer Layer that owns the model and its scene root.
 *
 * @returns {Promise<void>} Completion of the model load.
 *
 * @throws {Error} If the glTF scene is missing.
 * @throws {Error} If the glTF scene has no root nodes.
 */
export async function loadModel(layer) {
  await addedByLayer.get(layer).promise;
  const url = /* alloc */ new URL(modelUrlByLayer.get(layer), document.baseURI).href;
  const { description, images } = await runSourceWorker(layer._map, layer.options.workerUrl,
    /* alloc */ { type: 'model', url });
  await addedByLayer.get(layer).promise;
  await cameraViewByMap.get(layer._map);
  const context = createModelContext(layer, description, images);
  const scene = description.scenes?.[description.scene || 0];
  if (!scene) throw /* alloc */ new Error('Missing glTF scene');
  const nodes = buildModelNodes(context, scene);
  const model = /* alloc */ {
    ...emptyNode(),
    id: url,
    extras: description.extras || /* alloc */ {},
  };
  if (!nodes.length) throw /* alloc */ new Error('Expected a glTF model with a non-empty scene');
  let node;
  for (node of nodes) setParent(node, model);
  modelByLayer.set(layer, model);
  applyModelTransform(layer);
  setParent(modelByLayer.get(layer), rootByLayer.get(layer));
  conformModelToTerrain(layer, terrain3DByMap.get(layer._map));
}
