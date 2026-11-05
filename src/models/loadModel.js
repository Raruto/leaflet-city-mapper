import { sceneByLayer } from '../globals/sceneByLayer.js';
import { geometryEmpty } from '../globals/geometryEmpty.js';
import { cameraByMap } from '../globals/cameraByMap.js';

import { decodeModel } from './decodeModel.js';
import { setParent } from '../scene/setParent.js';
import { emptyNode } from '../scene/emptyNode.js';
import { conformModelToTerrain } from '../geometry/conformModelToTerrain.js';
import { loadBuffer } from './loadBuffer.js';
import { loadImage } from './loadImage.js';
import { materialFor } from './materialFor.js';
import { modelNode } from './modelNode.js';


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
  const bufferRequests = /* alloc */ [];
  let buffer, image, material, index, resource, attribute, node;
  for (buffer of description.buffers || geometryEmpty) bufferRequests.push(loadBuffer(buffer, directory));
  await Promise.all(bufferRequests);
  await sceneByLayer.get(backend)._added.promise;
  const imageRequests = /* alloc */ [];
  for (image of description.images || geometryEmpty) imageRequests.push(loadImage(description, directory, image));
  const images = await Promise.all(imageRequests);
  await sceneByLayer.get(cameraByMap.get(backend._map)?._terrain3D)?._terrainPromise;
  const context = /* alloc */ {
    backend, description, images,
    textures: /* alloc */ new Map(),
    materials: /* alloc */ [],
    active: /* alloc */ new Set(),
    resources: /* alloc */ [],
  };
  // Convert glTF materials directly to the shader's retained CPU styles.
  for (material of description.materials || geometryEmpty) context.materials.push(materialFor(context, material));
  const scene = description.scenes?.[description.scene || 0];
  if (!scene) throw /* alloc */ new Error('Missing glTF scene');
  const nodes = /* alloc */ [];
  try {
    for (index of scene.nodes) nodes.push(modelNode(context, index));
  } catch (error) {
    // Parsing can fail after earlier primitives allocated buffers/programs.
    for (resource of context.resources) {
      if (resource.attributes) {
        for (attribute of Object.values(resource.attributes)) attribute.buffer.destroy();
      } else {
        resource.pipelineCache.clear();
      }
    }
    throw error;
  }
  const model = /* alloc */ {
    ...emptyNode(),
    id: url,
    extras: description.extras || /* alloc */ {},
  };
  if (!nodes.length) throw /* alloc */ new Error('Expected a glTF model with a non-empty scene');
  for (node of nodes) setParent(node, model);
  sceneByLayer.get(backend).model = model;
  if (backend.options.rotation) {
    const [x, y = x, z = x] = backend.options.rotation;
    sceneByLayer.get(backend).model.rotation[0] = x; sceneByLayer.get(backend).model.rotation[1] = y; sceneByLayer.get(backend).model.rotation[2] = z;
  }
  if (backend.options.scale) {
    const [x, y = x, z = x] = backend.options.scale;
    sceneByLayer.get(backend).model.scale[0] = x; sceneByLayer.get(backend).model.scale[1] = y; sceneByLayer.get(backend).model.scale[2] = z;
  }
  setParent(sceneByLayer.get(backend).model, sceneByLayer.get(backend).root);
  conformModelToTerrain(backend, cameraByMap.get(backend._map)?._terrain3D);
}
