import { pluginState } from '../core/pluginState.js';
import * as disposeMesh from '../rendering/disposeMesh.js';
import * as setHighlight from '../picking/setHighlight.js';
import * as showFeature from '../picking/showFeature.js';

export function disposeTrafficObject(state, object) {
  if (!object) return;
  if (pluginState(state.layer).highlightedFeature?.mesh === object) {
    setHighlight.setHighlight(state.layer, null);
    pluginState(state.layer).hoveredFeature = null;
    showFeature.showFeature(state.layer, null);
  };
  disposeMesh.disposeMesh(state.layer, object);
}
