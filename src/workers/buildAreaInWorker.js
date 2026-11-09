import { geometryWorkerUrl } from '../globals/geometryWorkerUrl.js';
import { startGeometryWorker } from './startGeometryWorker.js';
import { acquireGeometryWorker } from './acquireGeometryWorker.js';

export async function buildAreaInWorker(context, signal) {
  const entry = acquireGeometryWorker(context.map || context.backend._map, context.backend.options.workerUrl || geometryWorkerUrl);
  const { worker, pool } = entry;
  const task = /* alloc */ {
    worker, signal,
    input: /* alloc */ { jobs: context.jobs, nightLight: Boolean(context.backend.options.nightLight) },
  };
  entry.task = task;
  let completed = false;
  try {
    const data = await /* alloc */ new Promise(startGeometryWorker.bind(null, task));
    let i;
    for (i = 0; i < data.ranges.length; i++) Object.assign(context.featureFaces[i], data.ranges[i]);
    context.positions = data.positions;
    context.uvs = data.uvs;
    context.lights = data.lights;
    context.preparedGeometry = data;
    completed = true;
  } finally {
    worker.removeEventListener('message', task.onEvent);
    worker.removeEventListener('error', task.onEvent);
    worker.removeEventListener('messageerror', task.onEvent);
    signal.removeEventListener('abort', task.onEvent);
    entry.task = null;
    if (completed && pool && !pool.closed && !signal.aborted) pool.idle.push(entry);
    else {
      if (!entry.closed) worker.terminate();
      if (pool) pool.entries.delete(entry);
    }
    if (entry.blobUrl) {
      URL.revokeObjectURL(entry.blobUrl);
      entry.blobUrl = null;
    }
    context.jobs = null;
  }
}
