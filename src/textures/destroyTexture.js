import { rendererByLayer } from '../weakmaps/rendererByLayer.js';




import { destroyAfterSubmission } from './destroyTextureAfterSubmission.js';

export function destroyTexture(layer, texture) {
  destroyAfterSubmission(layer, texture, rendererByLayer.get(layer).device.queue.onSubmittedWorkDone());
}
