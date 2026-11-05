import { state as sharedState } from '../state.js';
import { pluginState } from '../core/pluginState.js';

import { createProgram } from "../rendering/createProgram.js";
import { setParent } from "../scene/setParent.js";

import { createGeometry } from './createGeometry.js';

export function createRasterMesh(backend, tile) {
  const gpuCreateTexture1 = sharedState.allocationRenderCreateRasterMeshCreateTexture1;
  const gpuCreateSampler2 = sharedState.allocationRenderCreateRasterMeshCreateSampler2;
  const device = pluginState(backend).renderer.device;
  const texture = /* allocation: required -- The raster tile retains its own GPU texture, sampler and image lifetime. */ {
    device,
    texture: device.createTexture((
    gpuCreateTexture1.size[0] = tile.image.width,
    gpuCreateTexture1.size[1] = tile.image.height,
    gpuCreateTexture1.usage = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
    gpuCreateTexture1
  )),
    sampler: device.createSampler(gpuCreateSampler2),
    image: tile.image, format: 'rgba8unorm', srgb: false, uploaded: null,
  };
  const source = sharedState.allocationRenderDrawGeometryCopyExternalImageToTexture2;
  const destination = sharedState.allocationRenderDrawGeometryCopyExternalImageToTexture3;
  const dimensions = sharedState.allocationRenderDrawGeometryCopyExternalImageToTexture4;
  source.source = tile.image;
  source.flipY = false;
  destination.texture = texture.texture;
  dimensions[0] = tile.image.width;
  dimensions[1] = tile.image.height;
  device.queue.copyExternalImageToTexture(source, destination, dimensions);
  source.source = null;
  destination.texture = null;
  texture.uploaded = tile.image;

  if (!pluginState(backend)._rasterProgram) {
    pluginState(backend)._rasterProgram = createProgram(backend, /* allocation: required -- The raster program retains its first tile’s material and texture options. */ {
      baseTexture: texture, unlit: true, alphaMode: 'BLEND',
    });
  }
  if (!pluginState(backend)._rasterGeometry) pluginState(backend)._rasterGeometry = createGeometry(device);
  const { coords } = tile;
  const crs = backend._map.options.crs;
  const origin = crs.project(pluginState(backend).location);
  const metres = Math.cos(pluginState(backend).location.lat * Math.PI / 180);
  const scale = crs.scale(coords.z);
  const point = sharedState.allocationRenderRasterPoint;
  point.x = coords.x * sharedState.TILE_SIZE; point.y = coords.y * sharedState.TILE_SIZE;
  const corner = crs.transformation.untransform(point, scale);
  point.x = (coords.x + 1) * sharedState.TILE_SIZE; point.y = (coords.y + 1) * sharedState.TILE_SIZE;
  const opposite = crs.transformation.untransform(point, scale);
  const sizeX = (opposite.x - corner.x) * metres;
  const sizeZ = -(opposite.y - corner.y) * metres;
  tile.texture = texture;
  tile.mesh = /* allocation: required -- The raster scene retains this tile mesh until the tile is released. */ {
    position: /* allocation: required -- Each raster tile mesh owns its mutable scene position. */ [(corner.x - origin.x) * metres, 0, -(corner.y - origin.y) * metres],
    rotation: /* allocation: required -- Each raster tile mesh owns its mutable scene rotation. */ [0, 0, 0],
    scale: /* allocation: required -- Each raster tile mesh owns its mutable scene scale. */ [sizeX, 1, sizeZ],
    worldMatrix: /* allocation: required -- Each raster tile mesh owns its mutable world-transform matrix. */ [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    children: /* allocation: required -- Each raster tile mesh owns its scene-child list. */ [], visible: true, device, geometry: pluginState(backend)._rasterGeometry,
    program: pluginState(backend)._rasterProgram, texture,
    opacity: backend.options.opacity, id: sharedState.nextId++,
    renderOrder: backend.options.zIndex || 0, tile, fadeDuration: 250, ground: true,
  };
  setParent(tile.mesh, pluginState(backend).root);
}
