import { createMesh } from './createMesh.js';
import { destroyTexture } from './destroyTexture.js';
import { disposeMesh } from './disposeMesh.js';
import { nativeGeometry } from './nativeGeometry.js';
import { nativeEvents } from './nativeEvents.js';
import { parseColor } from './parseColor.js';
import { update } from './update.js';

/** Render from coordinates and detached raster sources; only accessible marker controls remain DOM. */
export async function nativeLayer(state) {
  const { source, map } = state;
  const backend = state.backend = new L.Layer({ source: { type: '3d' } });
  const meshes = state.meshes = new Map(), textures = new Map(), methods = new Map();
  const images = new Set();
  map._nativeGPUOrder ||= 0;
  map._nativeGPUBack ||= 0;
  let dirty = true, viewDirty = true, failed = false, order = ++map._nativeGPUOrder, rasterProgram;
  const marker = source instanceof L.Marker;
  const paneOrder = Number(getComputedStyle(source.getPane()).zIndex) || 0;
  const current = () => source._nativeGPU === state && map.hasLayer(source);
  const refresh = () => {
    dirty = true;
    viewDirty = true;
    failed = false;
    state.hide();
    const activeImages = [source._icon, source._shadow, source._image];
    for (const image of images) {
      if (activeImages.includes(image)) continue;
      image.removeEventListener('load', refresh);
      image.removeEventListener('error', imageError);
      images.delete(image);
    }
    for (const image of activeImages) {
      if (!(image instanceof HTMLImageElement) || images.has(image)) continue;
      images.add(image);
      image.addEventListener('load', refresh);
      image.addEventListener('error', imageError);
    }
    if (backend._shared) update(backend);
  };
  const imageError = () => source.fire('error', { error: new Error('Unable to load native layer image') });
  state.refresh = refresh;
  state.reorder = front => {
    order = front ? ++map._nativeGPUOrder : --map._nativeGPUBack;
    refresh();
  };
  const view = () => {
    viewDirty = true;
    if (backend._shared) update(backend);
  };
  const events = 'load tileload tileunload move drag';
  source.on(events, refresh);
  // Panning and camera changes never retriangulate paths or re-upload tile geometry.
  map.on('zoomend', refresh);
  if (marker) map.on('move zoom rotate pitch resize viewreset', view);
  const removeEvents = nativeEvents(state);
  for (const name of ['setLatLng', 'setLatLngs', 'addLatLng', 'setRadius', 'setStyle', 'redraw',
    'setIcon', 'setUrl', 'setBounds', 'setOpacity', 'setZIndex', 'setZIndexOffset', 'bringToFront', 'bringToBack']) {
    if (typeof source[name] !== 'function') continue;
    const own = Object.getOwnPropertyDescriptor(source, name), original = source[name];
    methods.set(name, own);
    source[name] = function (...args) {
      const result = original.apply(this, args);
      if ((name === 'bringToFront' || name === 'bringToBack') && this instanceof L.GridLayer) {
        const indices = Object.values(map._layers).filter(layer => layer !== this &&
          layer instanceof L.GridLayer && layer.getPane() === this.getPane()).map(layer => layer.options.zIndex || 0);
        const edge = name === 'bringToFront' ? Math.max(...indices) + 1 : Math.min(...indices) - 1;
        if (Number.isFinite(edge)) this.setZIndex(edge);
      }
      if (name === 'bringToFront') order = ++map._nativeGPUOrder;
      if (name === 'bringToBack') order = --map._nativeGPUBack;
      refresh();
      return result;
    };
  }
  state.dispose = () => {
    source.off(events, refresh);
    map.off('zoomend', refresh);
    if (marker) map.off('move zoom rotate pitch resize viewreset', view);
    removeEvents();
    state.refresh = state.reorder = null;
    for (const [name, descriptor] of methods) {
      if (descriptor) Object.defineProperty(source, name, descriptor);
      else delete source[name];
    }
    for (const mesh of meshes.values()) disposeMesh(backend, mesh);
    meshes.clear();
    for (const texture of textures.values()) destroyTexture(backend, texture.texture);
    textures.clear();
    for (const image of images) {
      image.removeEventListener('load', refresh);
      image.removeEventListener('error', imageError);
    }
    backend._beforeRender = null;
    backend.remove();
  };
  const ready = new Promise((resolve, reject) => {
    backend.once('ready', resolve);
    backend.once('error', ({ error }) => reject(error));
  });
  backend.on('error', ({ error }) => source.fire('error', { error }));
  refresh();
  backend.addTo(map);
  await ready.catch(error => {
    state.dispose();
    throw error;
  });
  if (!current()) return source;

  const local = latlng => {
    const crs = map.options.crs, origin = crs.project(backend.location), p = crs.project(latlng);
    const metres = Math.cos(backend.location.lat * Math.PI / 180);
    return [(p.x - origin.x) * metres, 0, -(p.y - origin.y) * metres];
  };
  const pixel = p => local(map.unproject(p));
  const styleMesh = (mesh, color, opacity) => {
    mesh.program.uniforms.baseColor.value = color;
    mesh.program.uniforms.opacity.value = opacity;
    if (source instanceof L.GridLayer) mesh.opacity = opacity;
    const zIndex = marker ? source._zIndex + (source._cameraZIndexOffset || 0) : source.options.zIndex;
    mesh.renderOrder = paneOrder * 1e6 + (zIndex || 0) * 1000 + order;
    mesh._nativeSource = source;
    mesh._nativeUsed = true;
  };
  const put = (key, position, color, opacity, texture, uv) => {
    if (!position.length) return;
    let mesh = meshes.get(key);
    const data = {
      position, normal: position.map((_, index) => index % 3 === 1 ? 1 : 0),
      ...(uv ? { uv } : {}),
    };
    if (!mesh || mesh.geometry.attributes.position.data.length !== position.length ||
      mesh.program.uniforms.baseTexture?.value !== texture) {
      if (mesh) disposeMesh(backend, mesh);
      mesh = createMesh(backend, data, {
        vertexColors: false, color, opacity, unlit: true, alphaMode: 'BLEND',
        ...(texture ? { baseTexture: texture } : {}),
      }, 0, source instanceof L.GridLayer ? rasterProgram : undefined);
      if (source instanceof L.GridLayer) {
        rasterProgram ||= mesh.program;
        mesh.texture = texture;
      }
      meshes.set(key, mesh);
    } else {
      const attribute = mesh.geometry.attributes.position;
      attribute.data.set(position);
      attribute.needsUpdate = true;
      mesh.geometry.bounds = null;
    }
    styleMesh(mesh, color, opacity);
    return mesh;
  };
  const textureFor = (key, image) => {
    if (!(image instanceof HTMLImageElement) && !(image instanceof HTMLCanvasElement)) {
      throw new Error('WebGPU native raster layers require image or canvas tiles');
    }
    let texture = textures.get(key);
    const url = image.currentSrc || image.src;
    if (!texture || texture.image !== image || texture.url !== url) {
      if (texture) {
        const mesh = meshes.get(key);
        if (mesh) disposeMesh(backend, mesh);
        meshes.delete(key);
        destroyTexture(backend, texture.texture);
        textures.delete(key);
      }
      const width = image.naturalWidth || image.width, height = image.naturalHeight || image.height;
      if (!width || !height) return;
      const { device } = backend.renderer;
      texture = {
        device, image, url, format: 'rgba8unorm', uploaded: null,
        texture: device.createTexture({
          size: [width, height], format: 'rgba8unorm',
          usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        }),
        sampler: device.createSampler({ minFilter: 'linear', magFilter: 'linear' }),
      };
      textures.set(key, texture);
      if (image instanceof HTMLCanvasElement) {
        texture.pending = true;
        // Snapshot asynchronously: copying a GPU-backed 2D canvas directly forces a blocking readback in Chromium.
        createImageBitmap(image).then(bitmap => {
          try {
            if (!current() || textures.get(key) !== texture) return;
            device.queue.copyExternalImageToTexture({ source: bitmap }, { texture: texture.texture }, [width, height]);
            texture.uploaded = image;
            texture.pending = false;
            refresh();
          } finally {
            bitmap.close();
          }
        }).catch(error => {
          failed = true;
          source.fire('error', { error });
        });
      } else {
        // CORS/security failures reject ready or emit error on the owning native layer.
        try {
          device.queue.copyExternalImageToTexture({ source: image }, { texture: texture.texture }, [width, height]);
        } catch (error) {
          texture.texture.destroy();
          textures.delete(key);
          throw error;
        }
        texture.uploaded = image;
      }
    }
    texture.used = true;
    return texture.uploaded === image ? texture : undefined;
  };
  const quad = (key, image, corners, opacity) => {
    const texture = textureFor(key, image);
    if (!texture) return;
    const indices = [0, 2, 1, 1, 2, 3];
    return put(key, indices.flatMap(i => corners[i]), [1, 1, 1], opacity, texture,
      indices.flatMap(i => [[0, 0], [1, 0], [0, 1], [1, 1]][i]));
  };
  const boundsQuad = bounds => [
    bounds.getNorthWest(), bounds.getNorthEast(), bounds.getSouthWest(), bounds.getSouthEast(),
  ].map(local);
  const synchronize = () => {
    if (!current() || !backend.renderer || failed) return;
    if (!dirty && (!marker || !viewDirty)) return;
    dirty = false;
    viewDirty = false;
    for (const mesh of meshes.values()) mesh._nativeUsed = false;
    for (const texture of textures.values()) texture.used = false;
    if (source instanceof L.GridLayer) {
      for (const [key, tile] of Object.entries(source._tiles || {})) {
        if (!tile.loaded || tile.el instanceof HTMLImageElement && !tile.el.naturalWidth) continue;
        const opacity = (source.options.opacity ?? 1) * (tile._gpuOpacity ?? 1);
        const retained = textures.get(key);
        let mesh = meshes.get(key);
        if (mesh && retained?.image === tile.el && retained.url === (tile.el.currentSrc || tile.el.src)) {
          retained.used = true;
          styleMesh(mesh, [1, 1, 1], opacity);
        } else {
          const [nw, se] = source._tileCoordsToNwSe(tile.coords);
          mesh = quad(key, tile.el, boundsQuad(new L.LatLngBounds(nw, se)), opacity);
        }
        if (mesh) mesh.renderOrder += tile.coords.z / 100;
      }
    } else if (source instanceof L.ImageOverlay) {
      if (source._image?.complete && source._image.naturalWidth) {
        quad('image', source._image, boundsQuad(source.getBounds()), source.options.opacity ?? 1);
      }
    } else if (marker) {
      for (const [key, image] of [['shadow', source._shadow], ['icon', source._icon]]) {
        if (!(image instanceof HTMLImageElement) || !image.complete || !image.naturalWidth) continue;
        const world = new DOMPoint(...local(source.getLatLng()), 1)
          .matrixTransform(new DOMMatrix(backend.root.worldMatrix));
        const clip = world.matrixTransform(new DOMMatrix(backend.camera.projectionViewMatrix));
        const inverse = new DOMMatrix(backend.camera.projectionViewMatrix).inverse();
        const toLocal = new DOMMatrix(backend.root.worldMatrix).inverse();
        const options = source.options.icon.options, size = map.getSize();
        const dimensions = options[key === 'shadow' ? 'shadowSize' : 'iconSize'] ||
          [image.naturalWidth, image.naturalHeight];
        const width = dimensions.x ?? dimensions[0], height = dimensions.y ?? dimensions[1];
        const anchor = (key === 'shadow' && options.shadowAnchor) ||
          options.iconAnchor || [Math.floor(width / 2), Math.floor(height / 2)];
        const center = new L.Point((clip.x / clip.w + 1) * size.x / 2, (1 - clip.y / clip.w) * size.y / 2);
        const left = center.x - (anchor.x ?? anchor[0]), top = center.y - (anchor.y ?? anchor[1]);
        const corners = [[left, top], [left + width, top],
          [left, top + height], [left + width, top + height]].map(([x, y]) => {
          const offset = source._cameraIconPoint(x - center.x, y - center.y);
          x = center.x + offset.x; y = center.y + offset.y;
          const p = new DOMPoint(x / size.x * 2 - 1,
            1 - y / size.y * 2, clip.z / clip.w, 1).matrixTransform(inverse);
          const result = new DOMPoint(p.x / p.w, p.y / p.w, p.z / p.w, 1).matrixTransform(toLocal);
          return [result.x, result.y, result.z];
        });
        const mesh = quad(key, image, corners, source.options.opacity ?? 1);
        if (key === 'shadow' && mesh) mesh.renderOrder -= 100 * 1e6;
      }
    } else {
      const { fill, stroke } = nativeGeometry(source, map, pixel);
      for (const [key, positions, color, opacity] of [
        ['fill', fill, source.options.fillColor || source.options.color, source.options.fillOpacity],
        ['stroke', stroke, source.options.color, source.options.opacity],
      ]) {
        if (!positions.length) continue;
        const { r, g, b } = parseColor(color);
        put(key, positions, [r, g, b], opacity ?? 1);
      }
    }
    for (const [key, mesh] of meshes) {
      if (mesh._nativeUsed) continue;
      disposeMesh(backend, mesh);
      meshes.delete(key);
      const texture = textures.get(key);
      if (texture) destroyTexture(backend, texture.texture);
      textures.delete(key);
    }
    for (const [key, texture] of textures) {
      if (texture.used) continue;
      destroyTexture(backend, texture.texture);
      textures.delete(key);
    }
  };
  backend._beforeRender = () => {
    try {
      synchronize();
    } catch (error) {
      failed = true;
      source.fire('error', { error });
    }
  };
  // ponytail: tessellate pixel-width strokes on zoomend; use shader extrusion for continuous zoom at scale.
  try {
    synchronize();
  } catch (error) {
    state.dispose();
    throw error;
  }
  update(backend);
  return source;
}
