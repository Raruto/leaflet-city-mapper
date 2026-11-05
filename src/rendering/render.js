import { frameCommands } from '../globals/frameCommands.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';
import { nativeRenderByLayer } from '../globals/nativeRenderByLayer.js';
import { cameraByMap } from '../globals/cameraByMap.js';


import { synchronizeZoomView } from './synchronizeZoomView.js';
import { resizeRenderer } from './resizeRenderer.js';
import { updateMapCamera } from './updateMapCamera.js';
import { collectFrameMeshes } from './collectFrameMeshes.js';
import { updateRoofRaster } from './updateRoofRaster.js';
import { prepareFrameMeshes } from './prepareFrameMeshes.js';
import { prepareFrameUniforms } from './prepareFrameUniforms.js';
import { drawSceneMeshes } from './drawSceneMeshes.js';
import { updateWorldMatrix } from "../scene/updateWorldMatrix.js";
import { renderSunlight } from '../shadows/renderSunlight.js';
import { cancelUpdate } from '../scene/cancelUpdate.js';
import { update } from '../scene/update.js';
import { pruneRasterTiles } from '../raster/pruneRasterTiles.js';
import { beforeNativeRender } from '../core/beforeNativeRender.js';

/**
 * Rendering owner: CSS pixels -> scene metres -> perspective camera.
 * Lights and transparent sort centers are converted into the current camera space.
 * Without raster tiles, logical map projection supplies the same static alignment.
 */

export function render(backend) {
  cancelUpdate(backend);
  if (sceneByLayer.get(backend)._shared !== backend || !sceneByLayer.get(backend).renderer) return;
  const map = backend._map;
  const now = performance.now();
  const size = map.getSize();
  if (!size.x || !size.y) return;
  synchronizeZoomView(backend, now);
  resizeRenderer(backend, size);
  updateMapCamera(backend, size);
  updateWorldMatrix(sceneByLayer.get(backend).scene);
  let sceneChanged = false;
  let layer, native;
  for (layer of sceneByLayer.get(backend)._layers) {
    native = nativeRenderByLayer.get(layer);
    if (!native) continue;
    beforeNativeRender(native);
    sceneChanged = true;
  }
  const sunlight = cameraByMap.get(map)._sunlight;
  collectFrameMeshes(backend, sunlight, sceneChanged);
  const shadowMeshes = sceneByLayer.get(backend)._shadowMeshes;
  const renderer = sceneByLayer.get(backend).renderer;
  const rasters = updateRoofRaster(backend, now);
  const meshes = renderer.frameMeshes ||= /* alloc */ [];
  meshes.length = 0;
  let appearing = prepareFrameMeshes(backend, rasters, now, meshes);
  const encoder = renderer.device.createCommandEncoder();
  prepareFrameUniforms(backend, meshes, shadowMeshes, sunlight);
  renderSunlight(backend, encoder, shadowMeshes, sunlight);
  drawSceneMeshes(backend, encoder, meshes);
  renderer.device.queue.writeBuffer(renderer.uniformBuffer, 0, renderer.uniformData, 0, renderer.uniformSlot * 64);
  renderer.device.queue.submit((
    frameCommands[0] = encoder.finish(),
    frameCommands
  ));
  frameCommands[0] = null;
  for (layer of sceneByLayer.get(backend)._layers) {
    if (sceneByLayer.get(layer)._wantedRasterTiles) appearing = pruneRasterTiles(layer) || appearing;
  }
  if (map._animatingZoom || appearing) update(backend);
}
