// Built-in vehicles for the 'traffic' type. Models are [ring of [x, z], bottom, top, rgb, topRing?] convex prisms in metres;
// forward is -z, right is +x. `topRing` (same length as `ring`) tapers the prism; rgb components above 1 are self-lit lamps.
/**
 * RGB paint colors used by built-in vehicle and pedestrian models.
 *
 * @type {Array<Array<number>>}
 */
export const paints = [
  [0.86, 0.86, 0.88],
  [0.1, 0.1, 0.12],
  [0.5, 0.53, 0.57],
  [0.65, 0.1, 0.08],
  [0.12, 0.25, 0.55],
  [0.85, 0.7, 0.15]
];
