import { demByLayer } from '../weakmaps/demByLayer.js';
import { rasterProgramByLayer } from '../weakmaps/rasterProgramByLayer.js';
import { rendererByLayer } from '../weakmaps/rendererByLayer.js';
import { terrainBoundsByLayer } from '../weakmaps/terrainBoundsByLayer.js';
import { terrainGridsByLayer } from '../weakmaps/terrainGridsByLayer.js';
import { terrainOriginElevationByLayer } from '../weakmaps/terrainOriginElevationByLayer.js';
import { terrainTilesByLayer } from '../weakmaps/terrainTilesByLayer.js';

import { demTexture } from '../globals/demTexture.js';
import { demTarget } from '../globals/demTarget.js';
import { demLayout } from '../globals/demLayout.js';
import { demSize } from '../globals/demSize.js';
import { createProgram } from './createProgram.js';
import { destroyTexture } from '../textures/destroyTexture.js';
import { terrainAtlas } from '../terrain/terrainAtlas.js';

export function rasterProgram(layer, texture) {
  const device = rendererByLayer.get(layer).device
  if (rasterProgramByLayer.get(layer)?.device === device) return rasterProgramByLayer.get(layer);
  // DEM atlas over the archive's tile grid; invalid or missing samples become -1e9 (the shader's no-data).
  // ponytail: one texture, capped by maxTextureDimension2D (32x32 DEM tiles at 8192 px); split it for larger archives.
  const bounds = terrainBoundsByLayer.get(layer), columns = bounds.max.x - bounds.min.x + 1, rows = bounds.max.y - bounds.min.y + 1;
  const { elevations, low, high } = terrainAtlas(terrainTilesByLayer.get(layer), bounds);
  if (demByLayer.get(layer)) destroyTexture(layer, demByLayer.get(layer).texture);
  demByLayer.set(layer, /* alloc */ {
    texture: device.createTexture((
      demTexture.size[0] = columns * 256,
      demTexture.size[1] = rows * 256,
      demTexture.usage = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
      demTexture
    )),
    low: Number.isFinite(low) ? low : terrainOriginElevationByLayer.get(layer),
    high: Number.isFinite(high) ? high : terrainOriginElevationByLayer.get(layer),
  });
  device.queue.writeTexture((
    demTarget.texture = demByLayer.get(layer).texture,
    demTarget
  ), elevations,
    (
      demLayout.bytesPerRow = columns * 1024,
      demLayout
    ), (
      demSize[0] = columns * 256,
      demSize[1] = rows * 256,
      demSize
    ));
  demTarget.texture = null;
  terrainGridsByLayer.set(layer, /* alloc */ new Map());
  rasterProgramByLayer.set(layer, createProgram(layer, /* alloc */ {
    baseTexture: texture,
    unlit: true,
    terrain: demByLayer.get(layer),
    alphaMode: 'BLEND',
    depthWrite: true,
    doubleSided: layer.options.doubleSided,
  }));
  return rasterProgramByLayer.get(layer);
}
