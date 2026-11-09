import { workerMapByLayer } from '../weakmaps/workerMapByLayer.js';
import { runSourceWorker } from './runSourceWorker.js';

export function getCogInWorker(context, z, x, y, signal) {
  return runSourceWorker(context.layer._map || workerMapByLayer.get(context.layer), context.workerUrl,
    /* alloc */ { type: 'cog', url: context.url, asset: context.asset, z, x, y }, signal);
}
