import { pluginState } from '../core/pluginState.js';
import { decodeModel } from './decodeModel.js';
import { setParent } from '../scene/setParent.js';
import { emptyNode } from '../scene/emptyNode.js';
import { conformModelToTerrain } from '../geometry/conformModelToTerrain.js';
import { loadBuffer } from './loadBuffer.js';
import { loadImage } from './loadImage.js';
import { materialFor } from './materialFor.js';
import { modelNode } from './modelNode.js';
import { state as sharedState } from '../state.js';

/** glTF/GLB model loading. */
/** Load the configured GLB/glTF (static triangles) under `root`; GPU resources need attachment. */

export async function loadModel(backend) {
  await pluginState(backend)._added.promise;
  const url = /* allocation: required -- URL resolution belongs to this concurrent model load. */ new URL(pluginState(backend).modelUrl, document.baseURI).href;
  const response = await fetch(url);
  if (!response.ok) {
    throw /* allocation: required -- Failed requests retain their own HTTP error and stack. */ new Error(`Unable to load model: HTTP ${response.status}`);
  }
  const data = await response.arrayBuffer();
  const description = decodeModel(data);
  const directory = /* allocation: required -- This model load resolves relative resources against its own directory. */ new URL('.', url).href;
  const bufferRequests = /* allocation: required -- Concurrent model loads retain independent buffer request groups across awaits. */ [];
  let buffer, image, material, index, resource, attribute, node;
  for (buffer of description.buffers || sharedState.allocationGeometryEmpty) bufferRequests.push(loadBuffer(buffer, directory));
  await Promise.all(bufferRequests);
  await pluginState(backend)._added.promise;
  const imageRequests = /* allocation: required -- Concurrent model loads retain independent image request groups across awaits. */ [];
  for (image of description.images || sharedState.allocationGeometryEmpty) imageRequests.push(loadImage(description, directory, image));
  const images = await Promise.all(imageRequests);
  await pluginState(pluginState(backend._map)?._terrain3D)?._terrainPromise;
  const context = /* allocation: required -- Recursive model conversion needs a load-owned resource and cycle-tracking context. */ {
    backend, description, images,
    textures: /* allocation: required -- Texture caching is scoped to this model and its GPU device. */ new Map(),
    materials: /* allocation: required -- Each model retains its converted material styles. */ [],
    active: /* allocation: required -- Cycle detection belongs to this recursive model traversal. */ new Set(),
    resources: /* allocation: required -- Failed model conversion destroys only resources allocated by this load. */ [],
  };
  // Convert glTF materials directly to the shader's retained CPU styles.
  for (material of description.materials || sharedState.allocationGeometryEmpty) context.materials.push(materialFor(context, material));
  const scene = description.scenes?.[pluginState(description).scene || 0];
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
  pluginState(backend).model = model;
  if (backend.options.rotation) {
    const [x, y = x, z = x] = backend.options.rotation;
    pluginState(backend).model.rotation[0] = x; pluginState(backend).model.rotation[1] = y; pluginState(backend).model.rotation[2] = z;
  }
  if (backend.options.scale) {
    const [x, y = x, z = x] = backend.options.scale;
    pluginState(backend).model.scale[0] = x; pluginState(backend).model.scale[1] = y; pluginState(backend).model.scale[2] = z;
  }
  setParent(pluginState(backend).model, pluginState(backend).root);
  conformModelToTerrain(backend, pluginState(backend._map)?._terrain3D);
}
