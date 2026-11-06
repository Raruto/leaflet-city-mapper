import { highlightedFeatureByLayer } from '../weakmaps/highlightedFeatureByLayer.js';



import { update } from '../scene/scheduleSceneUpdate.js';

/** Highlight a source vertex range in the shader; vertex colors stay untouched. */

export function setHighlight(layer, feature) {
  if (feature?.model) feature = null;
  if (highlightedFeatureByLayer.get(layer)?.mesh === feature?.mesh &&
    highlightedFeatureByLayer.get(layer)?.vertexStart === feature?.vertexStart) return;
  if (highlightedFeatureByLayer.get(layer)) highlightedFeatureByLayer.get(layer).mesh.highlight = null;
  highlightedFeatureByLayer.set(layer, feature);
  if (feature) {
    feature.mesh.highlightRange[0] = feature.vertexStart;
    feature.mesh.highlightRange[1] = feature.vertexEnd;
    feature.mesh.highlight = feature.mesh.highlightRange;
  }
  update(layer);
}
