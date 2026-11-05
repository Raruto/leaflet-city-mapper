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
  const url = /* allocation: required -- URL resolution belongs to this concurrent model load. */ new URL(sceneByLayer.get(backend).modelUrl, document.baseURI).href;
  const response = await fetch(url);
  if (!response.ok) {
    throw /* allocation: required -- Failed requests retain their own HTTP error and stack. */ new Error(`Unable to load model: HTTP ${response.status}`);
  }
  const data = await response.arrayBuffer();
  const description = decodeModel(data);
  const directory = /* allocation: required -- This model load resolves relative resources against its own directory. */ new URL('.', url).href;
  const bufferRequests = /* allocation: required -- Concurrent model loads retain independent buffer request groups across awaits. */ [];
  let buffer, image, material, index, resource, attribute, node;
  for (buffer of description.buffers || geometryEmpty) bufferRequests.push(loadBuffer(buffer, directory));
  await Promise.all(bufferRequests);
  await sceneByLayer.get(backend)._added.promise;
  const imageRequests = /* allocation: required -- Concurrent model loads retain independent image request groups across awaits. */ [];
  for (image of description.images || geometryEmpty) imageRequests.push(loadImage(description, directory, image));
  const images = await Promise.all(imageRequests);
  await sceneByLayer.get(cameraByMap.get(backend._map)?._terrain3D)?._terrainPromise;
  const context = /* allocation: required -- Recursive model conversion needs a load-owned resource and cycle-tracking context. */ {
    backend, description, images,
    textures: /* allocation: required -- Texture caching is scoped to this model and its GPU device. */ new Map(),
    materials: /* allocation: required -- Each model retains its converted material styles. */ [],
    active: /* allocation: required -- Cycle detection belongs to this recursive model traversal. */ new Set(),
    resources: /* allocation: required -- Failed model conversion destroys only resources allocated by this load. */ [],
  };
  // Convert glTF materials directly to the shader's retained CPU styles.
  for (material of description.materials || geometryEmpty) context.materials.push(materialFor(context, material));
  const scene = description.scenes?.[description.scene || 0];
  if (!scene) throw /* allocation: required -- Validation errors retain their own model-specific stack. */ new Error('Missing glTF scene');
  const nodes = /* allocation: required -- This model load retains root nodes until all conversion succeeds. */ [];
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
  const model = /* allocation: required -- The backend retains this independently attachable model root. */ {
    ...emptyNode(),
    id: url,
    extras: description.extras || /* allocation: required -- Model metadata remains independently editable per root. */ {},
  };
  if (!nodes.length) throw /* allocation: required -- Validation errors retain their own model-specific stack. */ new Error('Expected a glTF model with a non-empty scene');
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
