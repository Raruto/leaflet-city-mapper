import { layersByLayer } from '../weakmaps/layersByLayer.js';
import { rendererByLayer } from '../weakmaps/rendererByLayer.js';
import { sceneByLayer } from '../weakmaps/sceneByLayer.js';
import { shadowMeshesByLayer } from '../weakmaps/shadowMeshesByLayer.js';
import { sharedByLayer } from '../weakmaps/sharedByLayer.js';
import { wantedRasterTilesByLayer } from '../weakmaps/wantedRasterTilesByLayer.js';
import { sunlightByMap } from '../weakmaps/sunlightByMap.js';


import { frameCommands } from '../globals/frameCommands.js';
import { nativeRenderByLayer } from '../weakmaps/nativeRenderByLayer.js';


import { synchronizeZoomView } from '../animations/synchronizeZoomView.js';
import { resizeRenderer } from './resizeRenderer.js';
import { updateMapCamera } from '../camera/updateMapCamera.js';
import { collectFrameMeshes } from './collectFrameMeshes.js';
import { updateRoofRaster } from '../textures/updateRoofRaster.js';
import { prepareFrameMeshes } from './prepareFrameMeshes.js';
import { prepareFrameUniforms } from './prepareFrameUniforms.js';
import { drawSceneMeshes } from './drawSceneMeshes.js';
import { updateWorldMatrix } from "../transforms/updateWorldMatrix.js";
import { renderSunlight } from '../shadows/renderSunlight.js';
import { cancelUpdate } from '../scene/cancelUpdate.js';
import { update } from '../scene/scheduleSceneUpdate.js';
import { pruneRasterTiles } from '../raster/pruneRasterTiles.js';
import { beforeNativeRender } from '../native/beforeNativeRender.js';

/**
 * Rendering owner: CSS pixels -> scene metres -> perspective camera.
 * Lights and transparent sort centers are converted into the current camera space.
 * Without raster tiles, logical map projection supplies the same static alignment.
 */

export function render(layer) {
  cancelUpdate(layer);
  if (sharedByLayer.get(layer) !== layer || !rendererByLayer.get(layer)) return;
  const map = layer._map;
  const now = performance.now();
  const size = map.getSize();
  if (!size.x || !size.y) return;
  synchronizeZoomView(layer, now);
  resizeRenderer(layer, size);
  updateMapCamera(layer, size);
  updateWorldMatrix(sceneByLayer.get(layer));
  let sceneChanged = false;
  let sceneLayer, native;
  for (sceneLayer of layersByLayer.get(layer)) {
    native = nativeRenderByLayer.get(sceneLayer);
    if (!native) continue;
    beforeNativeRender(native);
    sceneChanged = true;
  }
  const sunlight = sunlightByMap.get(map);
  collectFrameMeshes(layer, sunlight, sceneChanged);
  const shadowMeshes = shadowMeshesByLayer.get(layer);
  const renderer = rendererByLayer.get(layer);
  const rasters = updateRoofRaster(layer, now);
  const meshes = renderer.frameMeshes ||= /* alloc */ [];
  meshes.length = 0;
  let appearing = prepareFrameMeshes(layer, rasters, now, meshes);
  const encoder = renderer.device.createCommandEncoder();
  prepareFrameUniforms(layer, meshes, shadowMeshes, sunlight);
  renderSunlight(layer, encoder, shadowMeshes, sunlight);
  drawSceneMeshes(layer, encoder, meshes);
  renderer.device.queue.writeBuffer(renderer.uniformBuffer, 0, renderer.uniformData, 0, renderer.uniformSlot * 64);
  renderer.device.queue.submit((
    frameCommands[0] = encoder.finish(),
    frameCommands
  ));
  frameCommands[0] = null;
  for (sceneLayer of layersByLayer.get(layer)) {
    if (wantedRasterTilesByLayer.get(sceneLayer)) appearing = pruneRasterTiles(sceneLayer) || appearing;
  }
  if (map._animatingZoom || appearing) update(layer);
}
