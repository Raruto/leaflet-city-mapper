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
  await backend._added.promise;
  const url = new URL(backend.modelUrl, document.baseURI).href;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unable to load model: HTTP ${response.status}`);
  }
  const data = await response.arrayBuffer();
  const description = decodeModel(data);
  const directory = new URL('.', url).href;
  const bufferRequests = [];
  let buffer, image, material, index, resource, attribute, node;
  for (buffer of description.buffers || []) bufferRequests.push(loadBuffer(buffer, directory));
  await Promise.all(bufferRequests);
  await backend._added.promise;
  const imageRequests = [];
  for (image of description.images || []) imageRequests.push(loadImage(description, directory, image));
  const images = await Promise.all(imageRequests);
  await backend._map?._terrain3D?._terrainPromise;
  const context = { backend, description, images, textures: new Map(), materials: [], active: new Set(), resources: [] };
  // Convert glTF materials directly to the shader's retained CPU styles.
  for (material of description.materials || []) context.materials.push(materialFor(context, material));
  const scene = description.scenes?.[description.scene || 0];
  if (!scene) throw new Error('Missing glTF scene');
  const nodes = [];
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
  const model = {
    ...emptyNode(),
    id: url,
    extras: description.extras || {},
  };
  if (!nodes.length) throw new Error('Expected a glTF model with a non-empty scene');
  for (node of nodes) setParent(node, model);
  backend.model = model;
  if (backend.options.rotation) {
    const [x, y = x, z = x] = backend.options.rotation;
    backend.model.rotation[0] = x; backend.model.rotation[1] = y; backend.model.rotation[2] = z;
  }
  if (backend.options.scale) {
    const [x, y = x, z = x] = backend.options.scale;
    backend.model.scale[0] = x; backend.model.scale[1] = y; backend.model.scale[2] = z;
  }
  setParent(backend.model, backend.root);
  conformModelToTerrain(backend, backend._map?._terrain3D);
}
