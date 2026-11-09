import { decodeModel } from './decodeModel.js';
import { loadModelResources } from './loadModelResources.js';
import { prepareModelGeometry } from './prepareModelGeometry.js';

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
