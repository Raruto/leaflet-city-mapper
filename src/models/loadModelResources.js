import { geometryEmpty } from '../globals/geometryEmpty.js';
import { loadBuffer } from './loadBuffer.js';
import { loadImage } from '../textures/loadModelImage.js';

/**
 * Load the buffers and images referenced by a decoded glTF document.
 *
 * @param {Object} description Decoded glTF document.
 * @param {string} directory Base URL for resource URIs.
 *
 * @returns {Promise<Array>} Loaded images.
 */
export async function loadModelResources(description, directory) {
  const bufferRequests = /* alloc */ [];
  let buffer;
  for (buffer of description.buffers || geometryEmpty) bufferRequests.push(loadBuffer(buffer, directory));
  await Promise.all(bufferRequests);
  const imageRequests = /* alloc */ [];
  let image;
  for (image of description.images || geometryEmpty) imageRequests.push(loadImage(description, directory, image));
  return Promise.all(imageRequests);
}
