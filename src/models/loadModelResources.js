import { geometryEmpty } from '../globals/geometryEmpty.js';
import { cameraByMap } from '../globals/cameraByMap.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';
import { loadBuffer } from './loadBuffer.js';
import { loadImage } from './loadImage.js';

export async function loadModelResources(backend, description, directory) {
  const bufferRequests = /* alloc */ [];
  let buffer;
  for (buffer of description.buffers || geometryEmpty) bufferRequests.push(loadBuffer(buffer, directory));
  await Promise.all(bufferRequests);
  await sceneByLayer.get(backend)._added.promise;
  const imageRequests = /* alloc */ [];
  let image;
  for (image of description.images || geometryEmpty) imageRequests.push(loadImage(description, directory, image));
  const images = await Promise.all(imageRequests);
  await sceneByLayer.get(cameraByMap.get(backend._map)?._terrain3D)?._terrainPromise;
  return images;
}
