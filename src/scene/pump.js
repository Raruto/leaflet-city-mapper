import { emptyNode } from "./emptyNode.js";
import { isClockWise } from "../geometry/isClockWise.js";
import { lampPostGeometry } from "../geometry/lampPostGeometry.js";
import { lightGeometry } from "../geometry/lightGeometry.js";
import { parseColor } from "../utils/parseColor.js";
import { treeGeometry } from "../geometry/treeGeometry.js";
import { triangulate } from "../geometry/triangulate.js";
import { createProgram } from '../rendering/createProgram.js';
import { updateStatus } from "./releaseArea.js";
import { loadSource } from '../pmtiles/loadSource.js';
import { setParent } from './setParent.js';
import { update } from './update.js';
import { getElevation } from "../terrain/getElevation.js";

/** Share four load/build slots across source layers, nearest ground blocks first. */

export function pump(backend, map = backend._map) {
  // Meshes need the shared renderer; _attach() re-runs _updateArea() once it exists.
  const shared = map && L.Layer._renderers.get(map);
  if (!shared) return;
  const layers = [...shared._layers].filter(layer =>
    Number.isFinite(layer._inflight) && layer._areas && (layer.url || layer._geojson));
  const pending = layers.flatMap(layer => [...layer._areas.values()]
    .filter(area => !area.started && !area.request.signal.aborted)
    .map(area => {
      const center = area.coords && map.project(map.getCenter(), area.coords.z).divideBy(256);
      return { layer, area, distance: center
        ? Math.hypot(area.coords.x + 0.5 - center.x, area.coords.y + 0.5 - center.y) / 2 ** area.coords.z : 0 };
    })).sort((a, b) => a.distance - b.distance);
  let inflight = layers.reduce((sum, layer) => sum + layer._inflight, 0);
  for (const { layer: backend, area } of pending) {
    if (inflight >= 4) break;
    if (backend._inflight >= 2) continue;
    area.started = true;
    backend._inflight++;
    inflight++;
    (async () => {
      try {
        // Let ground requests start first, and avoid rebuilding flat geometry when the DEM arrives.
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
        const features = data.features;
        const positions = [], normals = [], colors = [], uvs = [], featureFaces = [], lights = [];
        const supports = new Set();
        let skipped = 0;
        const crs = map.options.crs;
        const origin = crs.project(backend.location);
        const metres = Math.cos(backend.location.lat * Math.PI / 180);
        const groundOffset = point => point.ground || 0;
        const addTriangle = (a, ah, b, bh, c, ch, nx, ny, nz, color) => {
          const ux = b.x - a.x, uy = bh - ah, uz = a.y - b.y;
          const vx = c.x - a.x, vy = ch - ah, vz = a.y - c.y;
          // Orient the triangle to its intended outward normal after flipping north to -z.
          if ((uy * vz - uz * vy) * nx + (uz * vx - ux * vz) * ny + (ux * vy - uy * vx) * nz < 0) {
            const point = b, height = bh;
            b = c; bh = ch; c = point; ch = height;
          }
          positions.push(a.x, ah + groundOffset(a), -a.y,
            b.x, bh + groundOffset(b), -b.y,
            c.x, ch + groundOffset(c), -c.y);
          normals.push(nx, ny, nz, nx, ny, nz, nx, ny, nz);
          colors.push(color.r, color.g, color.b, color.r, color.g, color.b, color.r, color.g, color.b);
          if (backend.options.nightLight) uvs.push(...a.uv, ...b.uv, ...c.uv);
        };
        let deadline = performance.now() + 4;
        for (const feature of features) {
          if (area.request.signal.aborted) return;
          if (performance.now() >= deadline) {
            await new Promise(requestAnimationFrame);
            if (area.request.signal.aborted) return;
            deadline = performance.now() + 4;
          }
          const geometry = feature?.geometry;
          const isTree = geometry?.type === 'Point';
          if (backend.options.nightLight && !isTree) throw new Error('Night lights require Point geometry');
          const polygons = geometry?.type === 'Polygon' ? [geometry.coordinates] : geometry?.type === 'MultiPolygon' ? geometry.coordinates : null;
          if (!polygons && !isTree) throw new Error('Unsupported GeoJSON geometry');
          const [lon, lat] = (isTree ? geometry.coordinates : polygons[0]?.[0]?.[0]) ?? [];
          if (!Number.isFinite(lon) || !Number.isFinite(lat)) throw new Error('Invalid GeoJSON coordinates');
          if (coords) {
            const anchor = map.project(new L.LatLng(lat, lon), coords.z);
            // Overlapping archive blocks may contain the same polygon; its first vertex owns it.
            if (Math.floor(anchor.x / 256) !== coords.x || Math.floor(anchor.y / 256) !== coords.y) continue;
          }
          const style = backend.options.style(feature);
          if (style === null) {
            skipped++;
            continue;
          }
          if (!style || typeof style !== 'object') throw new Error('style must return an extrusion style or null');
          const { top, bottom = 0, color = 0xd9b38c } = style;
          if (!Number.isFinite(top) || !Number.isFinite(bottom) || bottom < 0 || top <= bottom) {
            throw new Error('Invalid extrusion heights: expected top > bottom >= 0');
          }
          const baseColor = parseColor(color);
          const vertexStart = positions.length / 3;
          if (isTree) {
            const point = crs.project(new L.LatLng(lat, lon));
            const elevation = map._terrain3D ? getElevation(map._terrain3D, [lat, lon]) : undefined;
            const projected = {
              x: (point.x - origin.x) * metres, y: (point.y - origin.y) * metres,
              ground: Number.isFinite(elevation) && Number.isFinite(backend.root.position[1])
                ? elevation - backend.root.position[1] : 0,
            };
            if (backend.options.nightLight) {
              if (!Number.isFinite(style.lightFlux) || style.lightFlux <= 0) throw new Error('Invalid light flux');
              const support = feature.properties?.cod_ouvrag || `${lon},${lat}`;
              if (style.poleRadius > 0 && !supports.has(support)) {
                lampPostGeometry(projected, style, addTriangle);
                supports.add(support);
              }
              lightGeometry(projected, style, addTriangle);
              lights.push({
                position: [projected.x, projected.ground + top, -projected.y],
                radius: Math.hypot(top, style.lightRadius), color: [baseColor.r, baseColor.g, baseColor.b],
                flux: style.lightFlux,
              });
            } else treeGeometry(projected, style, addTriangle);
          }
          for (const rings of polygons || []) {
            if (!rings.length) throw new Error('Empty GeoJSON polygon');
            const paths = rings.map(ring => {
              if (ring.length < 4) throw new Error('Invalid GeoJSON polygon ring');
              return ring.slice(0, -1).map(([lng, lat]) => {
                if (!Number.isFinite(lng) || !Number.isFinite(lat)) throw new Error('Invalid GeoJSON coordinates');
                const point = crs.project(new L.LatLng(lat, lng));
                const elevation = backend._map._terrain3D ? getElevation(backend._map._terrain3D, [lat, lng]) : undefined;
                return {
                  x: (point.x - origin.x) * metres,
                  y: (point.y - origin.y) * metres,
                  ground: Number.isFinite(elevation) && Number.isFinite(backend.root.position[1])
                    ? elevation - backend.root.position[1] : 0,
                };
              });
            });
            const points = paths.flat();
            for (const [a, b, c] of triangulate(paths[0], paths.slice(1))) {
              addTriangle(points[a], top, points[b], top, points[c], top, 0, 1, 0, baseColor);
              if (bottom > 0) addTriangle(points[a], bottom, points[b], bottom, points[c], bottom, 0, -1, 0, baseColor);
            }
            paths.forEach((path, index) => {
              // Interior walls face into the courtyard; exterior walls face away from the building.
              const sign = isClockWise(path) === (index === 0) ? -1 : 1;
              for (let i = 0; i < path.length; i++) {
                const a = path[i], b = path[(i + 1) % path.length];
                const length = Math.hypot(b.x - a.x, b.y - a.y);
                if (!length) continue;
                const nx = sign * (b.y - a.y) / length, nz = sign * (b.x - a.x) / length;
                addTriangle(a, bottom, b, bottom, b, top, nx, 0, nz, baseColor);
                addTriangle(a, bottom, b, top, a, top, nx, 0, nz, baseColor);
              }
            });
          }
          const vertexEnd = positions.length / 3;
          featureFaces.push({
            id: feature.id ?? feature.properties?.objectid ?? JSON.stringify(geometry),
            properties: feature.properties, baseColor,
            faceStart: vertexStart / 3, faceEnd: vertexEnd / 3, vertexStart, vertexEnd,
          });
        }
        if (!positions.length) {
          Object.assign(area, { mesh: null, buildings: 0, skipped, done: true });
          return;
        }
        const device = backend.renderer.device;
        const attributes = {
          position: { size: 3, data: new Float32Array(positions) },
          normal: { size: 3, data: new Float32Array(normals) },
          color: { size: 3, data: new Float32Array(colors) },
        };
        if (backend.options.nightLight) attributes.uv = { size: 2, data: new Float32Array(uvs) };
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
              ...(backend.options.nightLight ? { nightLight: true, alphaMode: 'BLEND', doubleSided: true } : {})
            }),
            id: L.Layer._nextId++,
            renderOrder: 0,
            fadeDuration: 250,
            extras: { featureFaces, lights },
          },
          buildings: featureFaces.length,
          skipped,
          done: true
        });
        setParent(area.mesh, backend.root);
        update(backend);
      } catch (error) {
        if (area.request.signal.aborted) return;
        area.error = error.message;
        backend.fire('error', { error });
      }
    })().finally(() => {
      backend._inflight--;
      pump(backend, map);
    });
  }
  for (const layer of layers) updateStatus(layer);
}
