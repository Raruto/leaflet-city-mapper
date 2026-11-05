import { state as sharedState } from '../state.js';
import { pluginState } from '../core/pluginState.js';
import { compareRoofTiles } from './compareRoofTiles.js';

export function composeRoofAtlas(backend, tiles, zoom, min, size, width, height) {
  const gpuCreateBuffer1 = sharedState.allocationRenderComposeRoofAtlasCreateBuffer1;
  const gpuBeginRenderPass2 = sharedState.allocationRenderComposeRoofAtlasBeginRenderPass2;
  const gpuCopyExternalImageToTexture3 = sharedState.allocationRenderComposeRoofAtlasCopyExternalImageToTexture3;
  const gpuCopyExternalImageToTexture4 = sharedState.allocationRenderComposeRoofAtlasCopyExternalImageToTexture4;
  const gpuCopyExternalImageToTexture5 = sharedState.allocationRenderComposeRoofAtlasCopyExternalImageToTexture5;
  const gpuCreateBindGroup6 = sharedState.allocationRenderComposeRoofAtlasCreateBindGroup6;
  const gpuSubmit7 = sharedState.allocationRenderComposeRoofAtlasSubmit7;
  const renderer = pluginState(backend).renderer, device = renderer.device, map = backend._map;
  const opacityLength = Math.max(1, tiles.length) * 64;
  if (sharedState.allocationRenderOpacities.length < opacityLength) {
    sharedState.allocationRenderOpacities = /* allocation: required -- Grow the reusable roof-composition upload buffer only when capacity is exhausted. */ new Float32Array(opacityLength);
  }
  const opacities = sharedState.allocationRenderOpacities;
  const opacityBuffer = device.createBuffer((
    gpuCreateBuffer1.size = opacities.byteLength,
    gpuCreateBuffer1.usage = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    gpuCreateBuffer1
  ));

  const encoder = device.createCommandEncoder();
  const atlasPass = encoder.beginRenderPass((
    gpuBeginRenderPass2.colorAttachments[0].view = pluginState(backend)._roofRaster.texture.texture.createView(),
    gpuBeginRenderPass2
  ));
  gpuBeginRenderPass2.colorAttachments[0].view = null;
  atlasPass.setPipeline(renderer.roofBlit.pipeline);
  tiles.sort(compareRoofTiles);
  let i, tile, layer, coords, image, source, tileSize, x, y;
  for ([i, { tile, layer }] of tiles.entries()) {
    ({ coords, image } = tile);
    source = tile.texture;
    if (source.uploaded !== source.image) {
      device.queue.copyExternalImageToTexture((
        gpuCopyExternalImageToTexture3.source = image,
        gpuCopyExternalImageToTexture3
      ), (
        gpuCopyExternalImageToTexture4.texture = source.texture,
        gpuCopyExternalImageToTexture4
      ),
        (
        gpuCopyExternalImageToTexture5[0] = source.texture.width,
        gpuCopyExternalImageToTexture5[1] = source.texture.height,
        gpuCopyExternalImageToTexture5
      ));
      gpuCopyExternalImageToTexture3.source = null;
      gpuCopyExternalImageToTexture4.texture = null;

      source.uploaded = source.image;
    }

    opacities[i * 64] = layer.options.opacity;
    tileSize = sharedState.TILE_SIZE * map.getZoomScale(zoom, coords.z);
    x = (coords.x * tileSize - min.x) * width / size.x;
    y = (coords.y * tileSize - min.y) * height / size.y;
    atlasPass.setViewport(x, y, Math.min(tileSize * width / size.x, width - x),
      Math.min(tileSize * height / size.y, height - y), 0, 1);
    atlasPass.setBindGroup(0, device.createBindGroup((
      gpuCreateBindGroup6.layout = renderer.roofBlit.pipeline.getBindGroupLayout(0),
      gpuCreateBindGroup6.entries[0].resource = source.texture.createView(),
      gpuCreateBindGroup6.entries[1].resource = renderer.roofBlit.sampler,
      gpuCreateBindGroup6.entries[2].resource.buffer = opacityBuffer,
      gpuCreateBindGroup6.entries[2].resource.offset = i * 256,
      gpuCreateBindGroup6
    )));
    gpuCreateBindGroup6.layout = null;
    gpuCreateBindGroup6.entries[0].resource = null;
    gpuCreateBindGroup6.entries[1].resource = null;
    gpuCreateBindGroup6.entries[2].resource.buffer = null;

    atlasPass.draw(4);
  }
  atlasPass.end();
  device.queue.writeBuffer(opacityBuffer, 0, opacities);
  device.queue.submit((
    gpuSubmit7[0] = encoder.finish(),
    gpuSubmit7
  ));
  gpuSubmit7[0] = null;
  opacityBuffer.destroy();
}
