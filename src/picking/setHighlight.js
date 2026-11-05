import { pluginState } from '../core/pluginState.js';
import { update } from '../scene/update.js';

/** Highlight a source vertex range in the shader; vertex colors stay untouched. */

export function setHighlight(backend, feature) {
  if (feature?.model) feature = null;
  if (pluginState(backend).highlightedFeature?.mesh === feature?.mesh &&
    pluginState(backend).highlightedFeature?.vertexStart === feature?.vertexStart) return;
  if (pluginState(backend).highlightedFeature) pluginState(backend).highlightedFeature.mesh.highlight = null;
  pluginState(backend).highlightedFeature = feature;
  if (feature) {
    feature.mesh.highlightRange[0] = feature.vertexStart;
    feature.mesh.highlightRange[1] = feature.vertexEnd;
    feature.mesh.highlight = feature.mesh.highlightRange;
  }
  update(backend);
}
