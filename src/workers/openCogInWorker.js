import { getCogHeader } from '../cog/getCogHeader.js';
import { getCogInWorker } from './getCogInWorker.js';

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
