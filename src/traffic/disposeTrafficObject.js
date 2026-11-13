import { highlightedFeatureByLayer } from '../weakmaps/highlightedFeatureByLayer.js';
import { hoveredFeatureByLayer } from '../weakmaps/hoveredFeatureByLayer.js';
import * as disposeMesh from '../rendering/disposeMesh.js';
import * as setHighlight from '../picking/setHighlight.js';
import * as showFeature from '../picking/showFeature.js';

/**
 * Dispose a traffic mesh, clearing the layer's highlight and tooltip if they reference it.
 *
 * @param {Object} state Traffic layer state.
 * @param {Object|null} object Mesh to dispose, if present.
 */
export function disposeTrafficObject(state, object) {
  if (!object) return;
  if (highlightedFeatureByLayer.get(state.layer)?.mesh === object) {
    setHighlight.setHighlight(state.layer, null);
    hoveredFeatureByLayer.set(state.layer, null);
    showFeature.showFeature(state.layer, null);
  };
  disposeMesh.disposeMesh(state.layer, object);
}
