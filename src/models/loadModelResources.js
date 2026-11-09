import { geometryEmpty } from '../globals/geometryEmpty.js';
import { loadBuffer } from './loadBuffer.js';
import { loadImage } from '../textures/loadModelImage.js';

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
