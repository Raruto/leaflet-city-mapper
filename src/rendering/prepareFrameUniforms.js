import { cameraByLayer } from '../weakmaps/cameraByLayer.js';
import { rendererByLayer } from '../weakmaps/rendererByLayer.js';
import { roofRasterByLayer } from '../weakmaps/roofRasterByLayer.js';



import { prepareFrameBuffer } from './prepareFrameBuffer.js';
import { updatePointLights } from '../lighting/updatePointLights.js';

export function prepareFrameUniforms(layer, meshes, shadowMeshes, sunlight) {
  const renderer = rendererByLayer.get(layer), camera = cameraByLayer.get(layer);
  const view = camera.viewMatrix, direction = sunlight?.direction;
  const x = direction ? direction[0] : -300;
  const y = direction ? direction[1] : 500;
  const z = direction ? direction[2] : 300;
  const lightX = view[0] * x + view[4] * y + view[8] * z;
  const lightY = view[1] * x + view[5] * y + view[9] * z;
  const lightZ = view[2] * x + view[6] * y + view[10] * z;
  const lightLength = Math.hypot(lightX, lightY, lightZ) || 1;
  const skyLength = Math.hypot(view[4], view[5], view[6]) || 1;
  // One uniform upload per frame: per-mesh writeBuffer calls dominate Firefox's GPU process.
  prepareFrameBuffer(layer, meshes, shadowMeshes);
  const frameData = renderer.uniformData;
  frameData.set(camera.viewMatrix, 0);
  frameData.set(camera.projectionMatrix, 16);
  if (roofRasterByLayer.get(layer)?.matrix) frameData.set(roofRasterByLayer.get(layer).matrix, 32);
  else {
    frameData.fill(0, 32, 48);
    frameData[32] = frameData[37] = frameData[42] = frameData[47] = 1;
  }
  frameData[48] = lightX / lightLength;
  frameData[49] = lightY / lightLength;
  frameData[50] = lightZ / lightLength;
  frameData[51] = sunlight && sunlight.altitude <= 0 ? 0 : 1;
  frameData[52] = view[4] / skyLength;
  frameData[53] = view[5] / skyLength;
  frameData[54] = view[6] / skyLength;
  const night = sunlight ? Math.max(0, Math.min(1, (3 - sunlight.altitude) / 9)) : 0;
  frameData[55] = night * night * (3 - 2 * night);
  const tint = sunlight?.tint;
  frameData[56] = tint ? tint[0] : 1;
  frameData[57] = tint ? tint[1] : 1;
  frameData[58] = tint ? tint[2] : 1;
  frameData[59] = 0;
  if (night > 0) updatePointLights(layer);
  renderer.uniformSlot = 1;
}
