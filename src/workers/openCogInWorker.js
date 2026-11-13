import { getCogHeader } from '../cog/getCogHeader.js';
import { getCogInWorker } from './getCogInWorker.js';

/**
 * Open a COG through a worker and expose header and tile retrieval methods.
 *
 * @param {L.Layer} layer Layer that owns the worker request.
 * @param {Object} options COG URL, optional asset and worker URL.
 *
 * @returns {Promise<Object>} An object exposing getHeader and getZxy.
 */
export async function openCogInWorker(layer, options) {
  const context = /* alloc */ {
    layer, url: /* alloc */ new URL(options.url, document.baseURI).href,
    asset: options.asset, workerUrl: options.workerUrl,
  };
  const header = await getCogInWorker(context);
  return /* alloc */ {
    getHeader: getCogHeader.bind(null, /* alloc */ { header }),
    getZxy: getCogInWorker.bind(null, context),
  };
}
