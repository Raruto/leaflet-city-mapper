import { prepareModel } from '../models/prepareModel.js';

/**
 * Prepare a model in the worker and transfer its buffers, reporting errors to the caller.
 *
 * @param {MessageEvent} event Request containing the model URL.
 *
 * @returns {Promise<void>} Resolves after the response is posted.
 */
export async function onModelMessage({ data }) {
  try {
    const result = await prepareModel(data.url);
    self.postMessage(/* alloc */ { description: result.description, images: result.images }, result.transfers);
  } catch (error) {
    self.postMessage(/* alloc */ { error: /* alloc */ { name: error.name, message: error.message } });
  }
}
