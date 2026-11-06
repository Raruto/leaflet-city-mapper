import { sceneByLayer } from '../globals/sceneByLayer.js';
import { cameraByMap } from '../globals/cameraByMap.js';

import { decodeModel } from './decodeModel.js';
import { setParent } from '../scene/setParent.js';
import { emptyNode } from '../scene/emptyNode.js';
import { conformModelToTerrain } from '../geometry/conformModelToTerrain.js';
import { loadModelResources } from './loadModelResources.js';
import { createModelContext } from './createModelContext.js';
import { buildModelNodes } from './buildModelNodes.js';
import { applyModelTransform } from './applyModelTransform.js';


/** glTF/GLB model loading. */
/** Load the configured GLB/glTF (static triangles) under `root`; GPU resources need attachment. */

export async function loadModel(backend) {
  await sceneByLayer.get(backend)._added.promise;
  const url = /* alloc */ new URL(sceneByLayer.get(backend).modelUrl, document.baseURI).href;
  const response = await fetch(url);
  if (!response.ok) {
    throw /* alloc */ new Error(`Unable to load model: HTTP ${response.status}`);
  }
  const data = await response.arrayBuffer();
  const description = decodeModel(data);
  const directory = /* alloc */ new URL('.', url).href;
  const images = await loadModelResources(backend, description, directory);
  const context = createModelContext(backend, description, images);
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
  sceneByLayer.get(backend).model = model;
  applyModelTransform(backend);
  setParent(sceneByLayer.get(backend).model, sceneByLayer.get(backend).root);
  conformModelToTerrain(backend, cameraByMap.get(backend._map)?._terrain3D);
}
