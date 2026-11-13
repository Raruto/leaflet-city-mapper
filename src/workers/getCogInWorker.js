import { workerMapByLayer } from '../weakmaps/workerMapByLayer.js';
import { runSourceWorker } from './runSourceWorker.js';

/**
 * Request a COG header or tile through the shared geometry worker pool.
 *
 * @param {Object} context Layer, source URL, asset and worker URL.
 * @param {number|undefined} z Tile zoom, or undefined for the header.
 * @param {number|undefined} x Tile column.
 * @param {number|undefined} y Tile row.
 * @param {AbortSignal|undefined} signal Cancellation signal.
 *
 * @returns {Promise<*>} The header or tile returned by the worker.
 */
export function getCogInWorker(context, z, x, y, signal) {
  return runSourceWorker(context.layer._map || workerMapByLayer.get(context.layer), context.workerUrl,
    /* alloc */ { type: 'cog', url: context.url, asset: context.asset, z, x, y }, signal);
}
