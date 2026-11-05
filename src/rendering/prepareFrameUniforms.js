import { destroyTexture } from './destroyTexture.js';
import { updatePointLights } from '../lighting/updatePointLights.js';

export function prepareFrameUniforms(backend, meshes, shadowMeshes, sunlight) {
  const renderer = backend.renderer, camera = backend.camera;
  const lightPoint = new DOMPoint(...(sunlight?.direction || [-300, 500, 300]), 0).matrixTransform(new DOMMatrix(camera.viewMatrix));
  const lightLength = Math.hypot(lightPoint.x, lightPoint.y, lightPoint.z) || 1;
  const light = [lightPoint.x / lightLength, lightPoint.y / lightLength, lightPoint.z / lightLength];
  const skyPoint = new DOMPoint(0, 1, 0, 0).matrixTransform(new DOMMatrix(camera.viewMatrix));
  const skyLength = Math.hypot(skyPoint.x, skyPoint.y, skyPoint.z) || 1;
  const sky = [skyPoint.x / skyLength, skyPoint.y / skyLength, skyPoint.z / skyLength];
  // One uniform upload per frame: per-mesh writeBuffer calls dominate Firefox's GPU process.
  // Slot 0 holds the camera; 256-byte mesh slots follow (double-sided meshes use two).
  if (!renderer.uniformBuffer || renderer.uniformBuffer.size < (meshes.length * 2 + shadowMeshes.length + 1) * 256) {
    if (renderer.uniformBuffer) destroyTexture(backend, renderer.uniformBuffer);
    renderer.uniformBuffer = renderer.device.createBuffer({
      size: Math.max(64, meshes.length * 4 + shadowMeshes.length * 2) * 256,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    renderer.uniformData = new Float32Array(renderer.uniformBuffer.size / 4);
  }
  const frameData = renderer.uniformData;
  frameData.set(camera.viewMatrix, 0);
  frameData.set(camera.projectionMatrix, 16);
  frameData.set(backend._roofRaster?.matrix || [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], 32);
  frameData.set(light, 48);
  frameData[51] = sunlight && sunlight.altitude <= 0 ? 0 : 1;
  frameData.set(sky, 52);
  const night = sunlight ? Math.max(0, Math.min(1, (3 - sunlight.altitude) / 9)) : 0;
  frameData[55] = night * night * (3 - 2 * night);
  frameData.set(sunlight?.tint || [1, 1, 1], 56);
  frameData[59] = 0;
  if (night > 0) updatePointLights(backend);
  renderer.uniformSlot = 1;
}
