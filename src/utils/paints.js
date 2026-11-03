// Built-in vehicles for the 'traffic' type. Models are [ring of [x, z], bottom, top, rgb, topRing?] convex prisms in metres;
// forward is -z, right is +x. `topRing` (same length as `ring`) tapers the prism; rgb components above 1 are self-lit lamps.
export const paints = [[0.86, 0.86, 0.88], [0.1, 0.1, 0.12], [0.5, 0.53, 0.57], [0.65, 0.1, 0.08], [0.12, 0.25, 0.55], [0.85, 0.7, 0.15]];
export const box = (x0, x1, z0, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
export const mirror = (x0, x1, z0, z1, ...rest) => [[box(x0, x1, z0, z1), ...rest], [box(-x1, -x0, z0, z1), ...rest]];
export const glass = [0.12, 0.15, 0.18], tyre = [0.05, 0.05, 0.05];
export const headlight = [1.9, 1.85, 1.7], taillight = [1.7, 0.06, 0.05];
