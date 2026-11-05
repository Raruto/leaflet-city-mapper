import { getRasterTileSize } from '../raster/getRasterTileSize.js';
import { compareRoofTiles } from './compareRoofTiles.js';

export function composeRoofAtlas(backend, tiles, zoom, min, size, width, height) {
  const renderer = backend.renderer, device = renderer.device, map = backend._map;
  const opacities = new Float32Array(Math.max(1, tiles.length) * 64);
  const opacityBuffer = device.createBuffer({
    size: opacities.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  const encoder = device.createCommandEncoder();
  const atlasPass = encoder.beginRenderPass({
    colorAttachments: [{
      view: backend._roofRaster.texture.texture.createView(),
      clearValue: { r: 0, g: 0, b: 0, a: 0 },
      loadOp: 'clear',
      storeOp: 'store',
    }],
  });
  atlasPass.setPipeline(renderer.roofBlit.pipeline);
  tiles.sort(compareRoofTiles);
  let i, tile, layer, coords, image, source, tileSize, offset, x, y;
  for ([i, { tile, layer }] of tiles.entries()) {
    ({ coords, image } = tile);
    source = tile.texture;
    if (source.uploaded !== source.image) {
      device.queue.copyExternalImageToTexture({ source: image }, { texture: source.texture },
        [source.texture.width, source.texture.height]);
      source.uploaded = source.image;
    }

    opacities[i * 64] = layer.options.opacity;
    tileSize = getRasterTileSize().multiplyBy(map.getZoomScale(zoom, coords.z));
    offset = new L.Point(coords.x, coords.y).scaleBy(tileSize).subtract(min);
    x = offset.x * width / size.x, y = offset.y * height / size.y;
    atlasPass.setViewport(x, y, Math.min(tileSize.x * width / size.x, width - x),
      Math.min(tileSize.y * height / size.y, height - y), 0, 1);
    atlasPass.setBindGroup(0, device.createBindGroup({
      layout: renderer.roofBlit.pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: source.texture.createView() },
        { binding: 1, resource: renderer.roofBlit.sampler },
        { binding: 2, resource: { buffer: opacityBuffer, offset: i * 256, size: 4 } },
      ],
    }));
    atlasPass.draw(4);
  }
  atlasPass.end();
  device.queue.writeBuffer(opacityBuffer, 0, opacities);
  device.queue.submit([encoder.finish()]);
  opacityBuffer.destroy();
}
