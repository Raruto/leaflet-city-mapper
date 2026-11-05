
import { destroyAfterSubmission } from './destroyAfterSubmission.js';

export function destroyTexture(layer, texture) {
  destroyAfterSubmission(layer, texture, layer.renderer.device.queue.onSubmittedWorkDone());
}
