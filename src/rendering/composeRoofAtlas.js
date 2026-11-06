import { roofBuffer } from '../globals/roofBuffer.js';
import { roofPass } from '../globals/roofPass.js';
import { uploadRoofTile } from './uploadRoofTile.js';
import { roofBindGroup } from '../globals/roofBindGroup.js';
import { roofCommands } from '../globals/roofCommands.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';
import { roofOpacities } from '../globals/roofOpacities.js';
import { TILE_SIZE } from '../globals/TILE_SIZE.js';


import { compareRoofTiles } from './compareRoofTiles.js';

export function composeRoofAtlas(backend, tiles, zoom, min, size, width, height) {
  const renderer = sceneByLayer.get(backend).renderer, device = renderer.device, map = backend._map;
  const opacityLength = Math.max(1, tiles.length) * 64;
  if (roofOpacities.value.length < opacityLength) {
    roofOpacities.value = /* alloc */ new Float32Array(opacityLength);
  }
  const opacities = roofOpacities.value;
  const opacityBuffer = device.createBuffer((
    roofBuffer.size = opacities.byteLength,
    roofBuffer.usage = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    roofBuffer
  ));

  const encoder = device.createCommandEncoder();
  const atlasPass = encoder.beginRenderPass((
    roofPass.colorAttachments[0].view = sceneByLayer.get(backend)._roofRaster.texture.texture.createView(),
    roofPass
  ));
  roofPass.colorAttachments[0].view = null;
  atlasPass.setPipeline(renderer.roofBlit.pipeline);
  tiles.sort(compareRoofTiles);
  let i, tile, layer, coords, source, tileSize, x, y;
  for ([i, { tile, layer }] of tiles.entries()) {
    ({ coords } = tile);
    source = tile.texture;
    uploadRoofTile(device, tile);

    opacities[i * 64] = layer.options.opacity;
    tileSize = TILE_SIZE * map.getZoomScale(zoom, coords.z);
    x = (coords.x * tileSize - min.x) * width / size.x;
    y = (coords.y * tileSize - min.y) * height / size.y;
    atlasPass.setViewport(x, y, Math.min(tileSize * width / size.x, width - x),
      Math.min(tileSize * height / size.y, height - y), 0, 1);
    atlasPass.setBindGroup(0, device.createBindGroup((
      roofBindGroup.layout = renderer.roofBlit.pipeline.getBindGroupLayout(0),
      roofBindGroup.entries[0].resource = source.texture.createView(),
      roofBindGroup.entries[1].resource = renderer.roofBlit.sampler,
      roofBindGroup.entries[2].resource.buffer = opacityBuffer,
      roofBindGroup.entries[2].resource.offset = i * 256,
      roofBindGroup
    )));
    roofBindGroup.layout = null;
    roofBindGroup.entries[0].resource = null;
    roofBindGroup.entries[1].resource = null;
    roofBindGroup.entries[2].resource.buffer = null;

    atlasPass.draw(4);
  }
  atlasPass.end();
  device.queue.writeBuffer(opacityBuffer, 0, opacities);
  device.queue.submit((
    roofCommands[0] = encoder.finish(),
    roofCommands
  ));
  roofCommands[0] = null;
  opacityBuffer.destroy();
}
