import * as disposeMesh from '../../rendering/meshes/disposeMesh.js';
import * as setHighlight from '../../scene/picking/setHighlight.js';
import * as showFeature from '../../scene/picking/showFeature.js';

export function disposeTrafficObject(state, object) {
  if (!object) return;
  if (state.layer.highlightedFeature?.mesh === object) {
    setHighlight.setHighlight(state.layer, null);
    state.layer.hoveredFeature = null;
    showFeature.showFeature(state.layer, null);
  };
  disposeMesh.disposeMesh(state.layer, object);
}
