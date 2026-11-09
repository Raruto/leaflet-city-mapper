import { runSourceWorker } from './runSourceWorker.js';

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
