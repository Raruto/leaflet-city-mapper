import { sceneByLayer } from '../globals/sceneByLayer.js';


import { update } from '../scene/update.js';

/** Highlight a source vertex range in the shader; vertex colors stay untouched. */

export function setHighlight(backend, feature) {
  if (feature?.model) feature = null;
  if (sceneByLayer.get(backend).highlightedFeature?.mesh === feature?.mesh &&
    sceneByLayer.get(backend).highlightedFeature?.vertexStart === feature?.vertexStart) return;
  if (sceneByLayer.get(backend).highlightedFeature) sceneByLayer.get(backend).highlightedFeature.mesh.highlight = null;
  sceneByLayer.get(backend).highlightedFeature = feature;
  if (feature) {
    feature.mesh.highlightRange[0] = feature.vertexStart;
    feature.mesh.highlightRange[1] = feature.vertexEnd;
    feature.mesh.highlight = feature.mesh.highlightRange;
  }
  update(backend);
}
