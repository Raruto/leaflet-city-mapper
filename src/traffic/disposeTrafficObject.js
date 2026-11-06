import { highlightedFeatureByLayer } from '../weakmaps/highlightedFeatureByLayer.js';
import { hoveredFeatureByLayer } from '../weakmaps/hoveredFeatureByLayer.js';
import { mutateWeakMap } from '../weakmaps/mutateWeakMap.js';



import * as disposeMesh from '../rendering/disposeMesh.js';
import * as setHighlight from '../picking/setHighlight.js';
import * as showFeature from '../picking/showFeature.js';

export function disposeTrafficObject(state, object) {
  if (!object) return;
  if (highlightedFeatureByLayer.get(state.layer)?.mesh === object) {
    setHighlight.setHighlight(state.layer, null);
    mutateWeakMap(hoveredFeatureByLayer, state.layer, "=", null);
    showFeature.showFeature(state.layer, null);
  };
  disposeMesh.disposeMesh(state.layer, object);
}
