import { addedByLayer } from '../weakmaps/addedByLayer.js';
import { cameraViewByMap } from '../weakmaps/cameraViewByMap.js';

import { geometryEmpty } from '../globals/geometryEmpty.js';
import { loadBuffer } from './loadBuffer.js';
import { loadImage } from './loadImage.js';

export async function loadModelResources(layer, description, directory) {
  const bufferRequests = /* alloc */ [];
  let buffer;
  for (buffer of description.buffers || geometryEmpty) bufferRequests.push(loadBuffer(buffer, directory));
  await Promise.all(bufferRequests);
  await addedByLayer.get(layer).promise;
  const imageRequests = /* alloc */ [];
  let image;
  for (image of description.images || geometryEmpty) imageRequests.push(loadImage(description, directory, image));
  const images = await Promise.all(imageRequests);
  await cameraViewByMap.get(layer._map);
  return images;
}
