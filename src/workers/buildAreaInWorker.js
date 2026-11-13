import { runSourceWorker } from './runSourceWorker.js';

/**
 * Prepare area geometry in a worker, copy the returned ranges and buffers, and release queued jobs.
 *
 * @param {Object} context Area preparation state and queued jobs.
 * @param {AbortSignal} signal Cancellation signal.
 *
 * @returns {Promise<void>} Resolves after the geometry is copied into the context.
 */
export async function buildAreaInWorker(context, signal) {
  try {
    const data = await runSourceWorker(context.map || context.backend._map, context.backend.options.workerUrl,
      /* alloc */ { jobs: context.jobs, nightLight: Boolean(context.backend.options.nightLight) }, signal);
    let i;
    for (i = 0; i < data.ranges.length; i++) Object.assign(context.featureFaces[i], data.ranges[i]);
    context.positions = data.positions;
    context.uvs = data.uvs;
    context.lights = data.lights;
    context.preparedGeometry = data;
  } finally {
    context.jobs = null;
  }
}
