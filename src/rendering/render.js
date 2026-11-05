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

/**
 * Rendering owner: CSS pixels -> scene metres -> perspective camera.
 * Lights and transparent sort centers are converted into the current camera space.
 * Without raster tiles, logical map projection supplies the same static alignment.
 */

export function render(backend) {
  cancelUpdate(backend);
  if (backend._shared !== backend || !backend.renderer) return;
  const map = backend._map;
  const now = performance.now();
  const size = map.getSize();
  if (!size.x || !size.y) return;
  synchronizeZoomView(backend, now);
  resizeRenderer(backend, size);
  updateMapCamera(backend, size);
  updateWorldMatrix(backend.scene);
  let sceneChanged = false;
  for (const layer of backend._layers) {
    if (!layer._beforeRender) continue;
    layer._beforeRender();
    sceneChanged = true;
  }
  const sunlight = map._sunlight;
  collectFrameMeshes(backend, sunlight, sceneChanged);
  const shadowMeshes = backend._shadowMeshes;
  const renderer = backend.renderer;
  const rasters = updateRoofRaster(backend, now);
  const meshes = renderer.frameMeshes ||= [];
  meshes.length = 0;
  let appearing = prepareFrameMeshes(backend, rasters, now, meshes);
  const encoder = renderer.device.createCommandEncoder();
  prepareFrameUniforms(backend, meshes, shadowMeshes, sunlight);
  renderSunlight(backend, encoder, shadowMeshes, sunlight);
  drawSceneMeshes(backend, encoder, meshes);
  renderer.device.queue.writeBuffer(renderer.uniformBuffer, 0, renderer.uniformData, 0, renderer.uniformSlot * 64);
  renderer.device.queue.submit([encoder.finish()]);
  for (const layer of backend._layers) {
    if (layer._wantedRasterTiles) appearing = pruneRasterTiles(layer) || appearing;
  }
  if (map._animatingZoom || appearing) update(backend);
}
