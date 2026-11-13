import { decodeModel } from './decodeModel.js';
import { loadModelResources } from './loadModelResources.js';
import { prepareModelGeometry } from './prepareModelGeometry.js';

/**
 * Fetch a static model and prepare its images and geometry for transfer from a worker.
 *
 * @param {string} url Model URL.
 *
 * @returns {Promise<Object>} Prepared description, images and transferables.
 *
 * @throws {Error} If the model response is not successful.
 * @throws {Error} If the glTF scene is missing.
 */
export async function prepareModel(url) {
  const response = await fetch(url);
  if (!response.ok) throw /* alloc */ new Error(`Unable to load model: HTTP ${response.status}`);
  const description = decodeModel(await response.arrayBuffer());
  const scene = description.scenes?.[description.scene || 0];
  if (!scene) throw /* alloc */ new Error('Missing glTF scene');
  const images = await loadModelResources(description, /* alloc */ new URL('.', url).href);
  const transfers = prepareModelGeometry(description, scene);
  let image;
  for (image of images) transfers.push(image);
  delete description.buffers;
  delete description.bufferViews;
  delete description.accessors;
  return /* alloc */ { description, images, transfers };
}
