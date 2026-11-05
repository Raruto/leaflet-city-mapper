import { sceneByLayer } from '../globals/sceneByLayer.js';


import * as disposeMesh from '../rendering/disposeMesh.js';
import * as setHighlight from '../picking/setHighlight.js';
import * as showFeature from '../picking/showFeature.js';

export function disposeTrafficObject(state, object) {
  if (!object) return;
  if (sceneByLayer.get(state.layer).highlightedFeature?.mesh === object) {
    setHighlight.setHighlight(state.layer, null);
    sceneByLayer.get(state.layer).hoveredFeature = null;
    showFeature.showFeature(state.layer, null);
  };
  disposeMesh.disposeMesh(state.layer, object);
}
