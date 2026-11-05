import { demTexture } from '../globals/demTexture.js';
import { demTarget } from '../globals/demTarget.js';
import { demLayout } from '../globals/demLayout.js';
import { demSize } from '../globals/demSize.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';
import { createProgram } from '../rendering/createProgram.js';
import { destroyTexture } from '../rendering/destroyTexture.js';
import { terrainAtlas } from './terrainAtlas.js';

export function rasterProgram(backend, texture) {
  const state = sceneByLayer.get(backend), device = state.renderer.device;
  if (state._rasterProgram?.device === device) return state._rasterProgram;
  // DEM atlas over the archive's tile grid; invalid or missing samples become -1e9 (the shader's no-data).
  // ponytail: one texture, capped by maxTextureDimension2D (32x32 DEM tiles at 8192 px); split it for larger archives.
  const bounds = state._terrainBounds, columns = bounds.max.x - bounds.min.x + 1, rows = bounds.max.y - bounds.min.y + 1;
  const { elevations, low, high } = terrainAtlas(state._terrainTiles, bounds);
  if (state._dem) destroyTexture(backend, state._dem.texture);
  state._dem = /* alloc */ {
    texture: device.createTexture((
      demTexture.size[0] = columns * 256,
      demTexture.size[1] = rows * 256,
      demTexture.usage = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
      demTexture
    )),
    low: Number.isFinite(low) ? low : state._terrainOriginElevation,
    high: Number.isFinite(high) ? high : state._terrainOriginElevation,
  };
  device.queue.writeTexture((
    demTarget.texture = state._dem.texture,
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
  state._terrainGrids = /* alloc */ new Map();
  state._rasterProgram = createProgram(backend, /* alloc */ {
    baseTexture: texture,
    unlit: true,
    terrain: state._dem,
    alphaMode: 'BLEND',
    depthWrite: true,
  });
  return state._rasterProgram;
}
