/** Simplification tolerance in tile units: about 0.7 screen pixels at the displayed scale. */
export function vectorTolerance(job, layer) {
  return layer.extent / 256 / 2 ** Math.max(-1, job.mapZoom - job.coords.z) * 0.7;
}
