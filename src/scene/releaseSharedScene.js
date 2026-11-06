import { rendererByLayer } from '../weakmaps/rendererByLayer.js';
import { roofRasterByLayer } from '../weakmaps/roofRasterByLayer.js';
import { sceneFields } from '../weakmaps/sceneFields.js';
import { zoomTransitionsByLayer } from '../weakmaps/zoomTransitionsByLayer.js';
import { zoomViewByLayer } from '../weakmaps/zoomViewByLayer.js';
import { cameraViewByMap } from '../weakmaps/cameraViewByMap.js';


import { renderers } from '../weakmaps/renderers.js';
import { sceneCleanupFields } from '../globals/sceneCleanupFields.js';
import { destroyTexture } from '../textures/destroyTexture.js';
import { releaseRenderer } from '../gpu/releaseRenderer.js';

export function releaseSharedScene(layer, map) {
  if (roofRasterByLayer.get(layer)) destroyTexture(layer, roofRasterByLayer.get(layer).texture.texture);
  roofRasterByLayer.set(layer, null);
  if (zoomTransitionsByLayer.get(layer)) {
    let animation;
    for (animation of zoomTransitionsByLayer.get(layer).keys()) animation.play();
  }
  zoomTransitionsByLayer.set(layer, null);
  zoomViewByLayer.set(layer, null);
  cameraViewByMap.delete(map);
  map.getContainer().classList.remove('leaflet-camera-zoom');
  const renderer = rendererByLayer.get(layer);
  renderer.canvas.remove();
  releaseRenderer(renderer, layer);
  renderers.delete(map);
  let key;
  for (key of sceneCleanupFields) sceneFields[key].delete(layer);
}
