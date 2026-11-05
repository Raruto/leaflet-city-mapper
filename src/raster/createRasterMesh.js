import { radians } from '../globals/radians.js';
import { rasterTexture } from '../globals/rasterTexture.js';
import { rasterSampler } from '../globals/rasterSampler.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';
import { meshImage } from '../globals/meshImage.js';
import { meshTarget } from '../globals/meshTarget.js';
import { meshCopySize } from '../globals/meshCopySize.js';
import { rasterPoint } from '../globals/rasterPoint.js';
import { TILE_SIZE } from '../globals/TILE_SIZE.js';
import { nextId } from '../globals/nextId.js';



import { createProgram } from "../rendering/createProgram.js";
import { setParent } from "../scene/setParent.js";

import { createGeometry } from './createGeometry.js';

export function createRasterMesh(backend, tile) {
  const device = sceneByLayer.get(backend).renderer.device;
  const texture = /* alloc */ {
    device,
    texture: device.createTexture((
    rasterTexture.size[0] = tile.image.width,
    rasterTexture.size[1] = tile.image.height,
    rasterTexture.usage = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
    rasterTexture
  )),
    sampler: device.createSampler(rasterSampler),
    image: tile.image, format: 'rgba8unorm', srgb: false, uploaded: null,
  };
  const source = meshImage;
  const destination = meshTarget;
  const dimensions = meshCopySize;
  source.source = tile.image;
  source.flipY = false;
  destination.texture = texture.texture;
  dimensions[0] = tile.image.width;
  dimensions[1] = tile.image.height;
  device.queue.copyExternalImageToTexture(source, destination, dimensions);
  source.source = null;
  destination.texture = null;
  texture.uploaded = tile.image;

  if (!sceneByLayer.get(backend)._rasterProgram) {
    sceneByLayer.get(backend)._rasterProgram = createProgram(backend, /* alloc */ {
      baseTexture: texture, unlit: true, alphaMode: 'BLEND',
    });
  }
  if (!sceneByLayer.get(backend)._rasterGeometry) sceneByLayer.get(backend)._rasterGeometry = createGeometry(device);
  const { coords } = tile;
  const crs = backend._map.options.crs;
  const origin = crs.project(sceneByLayer.get(backend).location);
  const metres = Math.cos(sceneByLayer.get(backend).location.lat * radians);
  const scale = crs.scale(coords.z);
  const point = rasterPoint;
  point.x = coords.x * TILE_SIZE; point.y = coords.y * TILE_SIZE;
  const corner = crs.transformation.untransform(point, scale);
  point.x = (coords.x + 1) * TILE_SIZE; point.y = (coords.y + 1) * TILE_SIZE;
  const opposite = crs.transformation.untransform(point, scale);
  const sizeX = (opposite.x - corner.x) * metres;
  const sizeZ = -(opposite.y - corner.y) * metres;
  tile.texture = texture;
  tile.mesh = /* alloc */ {
    position: /* alloc */ [(corner.x - origin.x) * metres, 0, -(corner.y - origin.y) * metres],
    rotation: /* alloc */ [0, 0, 0],
    scale: /* alloc */ [sizeX, 1, sizeZ],
    worldMatrix: /* alloc */ [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    children: /* alloc */ [], visible: true, device, geometry: sceneByLayer.get(backend)._rasterGeometry,
    program: sceneByLayer.get(backend)._rasterProgram, texture,
    opacity: backend.options.opacity, id: nextId.value++,
    renderOrder: backend.options.zIndex || 0, tile, fadeDuration: 250, ground: true,
  };
  setParent(tile.mesh, sceneByLayer.get(backend).root);
}
