import { sceneByLayer } from '../globals/sceneByLayer.js';



import { destroyAfterSubmission } from './destroyAfterSubmission.js';

export function destroyTexture(layer, texture) {
  destroyAfterSubmission(layer, texture, sceneByLayer.get(layer).renderer.device.queue.onSubmittedWorkDone());
}
