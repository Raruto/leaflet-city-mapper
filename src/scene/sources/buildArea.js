import { loadSource } from '../../pmtiles/archive/loadSource.js';
import { sourceAreaContext } from './sourceAreaContext.js';
import { parseColor } from '../../utils/parseColor.js';
import { projectedTree } from './projectedTree.js';
import { generateTreeGeometry } from './generateTreeGeometry.js';
import { lampPostGeometry } from '../../geometry/lights/lampPostGeometry.js';
import { lightGeometry } from '../../geometry/lights/lightGeometry.js';
import { treeGeometry } from '../../geometry/trees/treeGeometry.js';
import { projectRing } from './projectRing.js';
import { triangulate } from '../../geometry/triangulation/triangulate.js';
import { addTriangle } from './addTriangle.js';
import { isClockWise } from '../../geometry/triangulation/isClockWise.js';
import { emptyNode } from '../graph/emptyNode.js';
import { createProgram } from '../../rendering/pipelines/createProgram.js';
import { cityMapper } from '../../constants/cityMapper.js';
import { setParent } from '../graph/setParent.js';
import { update } from '../lifecycle/update.js';
import { pump } from './pump.js';

export async function buildArea(backend, area, map) {
  try {
    await new Promise(requestAnimationFrame);
    await map._terrain3D?._terrainPromise;
    if (area.request.signal.aborted) return;
    const coords = area.coords;
    const data = await loadSource(backend, area);
    if (area.request.signal.aborted) return;
    if (data?.type !== 'FeatureCollection' || !Array.isArray(data.features)) {
      throw new Error('Invalid GeoJSON response');
    }
    if (backend._geojson && typeof backend.options.style !== 'function') {
      throw new Error('style must be a function');
    }
    const context = sourceAreaContext(backend, area, map);
    let deadline = performance.now() + 4;
    for (const feature of data.features) {
      if (area.request.signal.aborted) return;
      if (performance.now() >= deadline) {
        await new Promise(requestAnimationFrame);
        if (area.request.signal.aborted) return;
        deadline = performance.now() + 4;
      }
      const geometry = feature?.geometry;
      const isTree = geometry?.type === 'Point';
      if (backend.options.nightLight && !isTree) throw new Error('Night lights require Point geometry');
      const polygons = geometry?.type === 'Polygon' ? [geometry.coordinates] :
        geometry?.type === 'MultiPolygon' ? geometry.coordinates : null;
      if (!polygons && !isTree) throw new Error('Unsupported GeoJSON geometry');
      const [lon, lat] = (isTree ? geometry.coordinates : polygons[0]?.[0]?.[0]) ?? [];
      if (!Number.isFinite(lon) || !Number.isFinite(lat)) throw new Error('Invalid GeoJSON coordinates');
      if (coords) {
        const anchor = map.project(new L.LatLng(lat, lon), coords.z);
        if (Math.floor(anchor.x / 256) !== coords.x || Math.floor(anchor.y / 256) !== coords.y) continue;
      }
      const style = backend.options.style(feature);
      if (style === null) {
        context.skipped++;
        continue;
      }
      if (!style || typeof style !== 'object') throw new Error('style must return an extrusion style or null');
      const { top, bottom = 0, color = 0xd9b38c } = style;
      if (!Number.isFinite(top) || !Number.isFinite(bottom) || bottom < 0 || top <= bottom) {
        throw new Error('Invalid extrusion heights: expected top > bottom >= 0');
      }
      const baseColor = parseColor(color);
      const vertexStart = context.positions.length / 3;
      if (isTree) {
        const projected = projectedTree(context, lon, lat);
        if (backend.options.nightLight) {
          if (!Number.isFinite(style.lightFlux) || style.lightFlux <= 0) throw new Error('Invalid light flux');
          const support = feature.properties?.cod_ouvrag || `${lon},${lat}`;
          if (style.poleRadius > 0 && !context.supports.has(support)) {
            generateTreeGeometry(context, lampPostGeometry, projected, style);
            context.supports.add(support);
          }
          generateTreeGeometry(context, lightGeometry, projected, style);
          context.lights.push({
            position: [projected.x, projected.ground + top, -projected.y],
            radius: Math.hypot(top, style.lightRadius), color: [baseColor.r, baseColor.g, baseColor.b],
            flux: style.lightFlux,
          });
        } else generateTreeGeometry(context, treeGeometry, projected, style);
      }
      for (const rings of polygons || []) {
        if (!rings.length) throw new Error('Empty GeoJSON polygon');
        const paths = [];
        for (const ring of rings) paths.push(projectRing(context, ring));
        const points = [];
        for (const path of paths) for (const point of path) points.push(point);
        for (const [a, b, c] of triangulate(paths[0], paths.slice(1))) {
          addTriangle(context, points[a], top, points[b], top, points[c], top, 0, 1, 0, baseColor);
          if (bottom > 0) addTriangle(context, points[a], bottom, points[b], bottom, points[c], bottom, 0, -1, 0, baseColor);
        }
        for (let index = 0; index < paths.length; index++) {
          const path = paths[index];
          const sign = isClockWise(path) === (index === 0) ? -1 : 1;
          for (let i = 0; i < path.length; i++) {
            const a = path[i], b = path[(i + 1) % path.length];
            const length = Math.hypot(b.x - a.x, b.y - a.y);
            if (!length) continue;
            const nx = sign * (b.y - a.y) / length, nz = sign * (b.x - a.x) / length;
            addTriangle(context, a, bottom, b, bottom, b, top, nx, 0, nz, baseColor);
            addTriangle(context, a, bottom, b, top, a, top, nx, 0, nz, baseColor);
          }
        }
      }
      const vertexEnd = context.positions.length / 3;
      context.featureFaces.push({
        id: feature.id ?? feature.properties?.objectid ?? JSON.stringify(geometry),
        properties: feature.properties, baseColor,
        faceStart: vertexStart / 3, faceEnd: vertexEnd / 3, vertexStart, vertexEnd,
      });
    }
    if (!context.positions.length) {
      Object.assign(area, { mesh: null, buildings: 0, skipped: context.skipped, done: true });
      return;
    }
    const device = backend.renderer.device;
    const attributes = {
      position: { size: 3, data: new Float32Array(context.positions) },
      normal: { size: 3, data: new Float32Array(context.normals) },
      color: { size: 3, data: new Float32Array(context.colors) },
    };
    if (backend.options.nightLight) attributes.uv = { size: 2, data: new Float32Array(context.uvs) };
    for (const [name, attribute] of Object.entries(attributes)) {
      attribute.count = attribute.data.length / attribute.size;
      attribute.buffer = device.createBuffer({
        size: Math.max(4, attribute.data.byteLength),
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      });
      device.queue.writeBuffer(attribute.buffer, 0, attribute.data);
    }
    const meshGeometry = {
      device,
      attributes,
      drawRange: { start: 0, count: attributes.position.count },
    };
    Object.assign(area, {
      mesh: {
        ...emptyNode(),
        device,
        geometry: meshGeometry,
        program: createProgram(backend, {
          vertexColors: true, roofTexture: Boolean(backend.options.roofTexture),
          ...(backend.options.nightLight ? { nightLight: true, alphaMode: 'BLEND', doubleSided: true } : {}),
        }),
        id: cityMapper.nextId++,
        renderOrder: 0,
        fadeDuration: 250,
        extras: { featureFaces: context.featureFaces, lights: context.lights },
      },
      buildings: context.featureFaces.length,
      skipped: context.skipped,
      done: true,
    });
    setParent(area.mesh, backend.root);
    update(backend);
  } catch (error) {
    if (!area.request.signal.aborted) {
      area.error = error.message;
      backend.fire('error', { error });
    }
  } finally {
    backend._inflight--;
    pump(backend, map);
  }
}
