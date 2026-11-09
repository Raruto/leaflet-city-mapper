import { reportError } from '../scene/reportLayerError.js';

export function forwardVectorTileError({ error }) {
  reportError(this, error);
}
