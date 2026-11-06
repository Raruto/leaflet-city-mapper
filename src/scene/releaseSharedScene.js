import { sceneByLayer } from '../globals/sceneByLayer.js';
import { renderers } from '../globals/renderers.js';
import { cameraByMap } from '../globals/cameraByMap.js';
import { sceneCleanupFields } from '../globals/sceneCleanupFields.js';
import { destroyTexture } from '../rendering/destroyTexture.js';
import { releaseRenderer } from './releaseRenderer.js';

export function releaseSharedScene(backend, map) {
  if (sceneByLayer.get(backend)._roofRaster) destroyTexture(backend, sceneByLayer.get(backend)._roofRaster.texture.texture);
  sceneByLayer.get(backend)._roofRaster = null;
  if (sceneByLayer.get(backend)._zoomTransitions) {
    let animation;
    for (animation of sceneByLayer.get(backend)._zoomTransitions.keys()) animation.play();
  }
  sceneByLayer.get(backend)._zoomTransitions = null;
  sceneByLayer.get(backend)._zoomView = null;
  delete cameraByMap.get(map)._cameraView;
  map.getContainer().classList.remove('leaflet-camera-zoom');
  const renderer = sceneByLayer.get(backend).renderer;
  renderer.canvas.remove();
  releaseRenderer(renderer, backend);
  renderers.delete(map);
  let key;
  for (key of sceneCleanupFields) delete sceneByLayer.get(backend)[key];
}
