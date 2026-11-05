import { pluginState } from '../core/pluginState.js';

import { destroyAfterSubmission } from './destroyAfterSubmission.js';

export function destroyTexture(layer, texture) {
  destroyAfterSubmission(layer, texture, pluginState(layer).renderer.device.queue.onSubmittedWorkDone());
}
