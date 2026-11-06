import { addedByLayer } from '../weakmaps/addedByLayer.js';
import { modelByLayer } from '../weakmaps/modelByLayer.js';
import { modelUrlByLayer } from '../weakmaps/modelUrlByLayer.js';
import { rootByLayer } from '../weakmaps/rootByLayer.js';
import { terrain3DByMap } from '../weakmaps/terrain3DByMap.js';



import { decodeModel } from './decodeModel.js';
import { setParent } from '../scene/setParent.js';
import { emptyNode } from '../scene/createSceneNode.js';
import { conformModelToTerrain } from '../geometry/conformModelToTerrain.js';
import { loadModelResources } from './loadModelResources.js';
import { createModelContext } from './createModelContext.js';
import { buildModelNodes } from './buildModelNodes.js';
import { applyModelTransform } from './applyModelTransform.js';


/** glTF/GLB model loading. */
/** Load the configured GLB/glTF (static triangles) under `root`; GPU resources need attachment. */

export async function loadModel(layer) {
  await addedByLayer.get(layer).promise;
  const url = /* alloc */ new URL(modelUrlByLayer.get(layer), document.baseURI).href;
  const response = await fetch(url);
  if (!response.ok) {
    throw /* alloc */ new Error(`Unable to load model: HTTP ${response.status}`);
  }
  const data = await response.arrayBuffer();
  const description = decodeModel(data);
  const directory = /* alloc */ new URL('.', url).href;
  const images = await loadModelResources(layer, description, directory);
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
