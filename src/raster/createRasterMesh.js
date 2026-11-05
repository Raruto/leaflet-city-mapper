import { cityMapper } from "../constants/cityMapper.js";
import { createProgram } from "../rendering/createProgram.js";
import { setParent } from "../scene/setParent.js";
import { TILE_SIZE } from "../constants/TILE_SIZE.js";
import { createGeometry } from './createGeometry.js';

export function createRasterMesh(backend, tile) {
  const device = backend.renderer.device;
  const texture = {
    device,
    texture: device.createTexture({
      size: [tile.image.width, tile.image.height],
      format: 'rgba8unorm',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
    }),
    sampler: device.createSampler({ addressModeU: 'clamp-to-edge', addressModeV: 'clamp-to-edge',
      magFilter: 'linear', minFilter: 'linear' }),
    image: tile.image, format: 'rgba8unorm', srgb: false, uploaded: null,
  };
  if (!backend._rasterProgram) {
    backend._rasterProgram = createProgram(backend, {
      baseTexture: texture, unlit: true, alphaMode: 'BLEND',
    });
  }
  if (!backend._rasterGeometry) backend._rasterGeometry = createGeometry(device);
  const { coords } = tile;
  const crs = backend._map.options.crs;
  const origin = crs.project(backend.location);
  const metres = Math.cos(backend.location.lat * Math.PI / 180);
  const scale = crs.scale(coords.z);
  const corner = crs.transformation.untransform(new L.Point(coords.x * TILE_SIZE, coords.y * TILE_SIZE), scale);
  const opposite = crs.transformation.untransform(new L.Point((coords.x + 1) * TILE_SIZE, (coords.y + 1) * TILE_SIZE), scale);
  const sizeX = (opposite.x - corner.x) * metres;
  const sizeZ = -(opposite.y - corner.y) * metres;
  tile.texture = texture;
  tile.mesh = {
    position: [(corner.x - origin.x) * metres, 0, -(corner.y - origin.y) * metres],
    rotation: [0, 0, 0],
    scale: [sizeX, 1, sizeZ],
    worldMatrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    children: [], visible: true, device, geometry: backend._rasterGeometry,
    program: backend._rasterProgram, texture,
    opacity: backend.options.opacity, id: cityMapper.nextId++,
    renderOrder: backend.options.zIndex || 0, tile, fadeDuration: 250, ground: true,
  };
  setParent(tile.mesh, backend.root);
}
