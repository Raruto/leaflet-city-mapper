import * as createMeshApi from '../rendering/createMesh.js';
import * as disposeMesh from '../rendering/disposeMesh.js';
import * as setHighlight from '../scene/setHighlight.js';
import * as showFeature from '../scene/showFeature.js';
import { update as updateScene } from '../scene/update.js';
import { along } from './along.js';
import { build } from '../geometry/build.js';
import { computeBounds } from '../geometry/computeBounds.js';
import { routeGeometry } from './routeGeometry.js';
import { toLanes } from './toLanes.js';
import { tripsAt } from './tripsAt.js';
import { underEntry } from '../scene/underEntry.js';
import { getElevation } from '../terrain/getElevation.js';

export function trafficNow(state) {
  let control = { live: true };
  state.layer._map?.eachLayer(other => { if (other.control?.time) control = other.control; });
  return { live: control.live, time: control.live ? new Date() : control.time };
}

export function createTrafficMesh(state, data, featureFaces, material, usage = 0) {
  const result = createMeshApi.createMesh(state.layer, data, material, usage);
  result.extras.featureFaces = featureFaces;
  return result;
}

export function disposeTrafficObject(state, object) {
  if (!object) return;
  if (state.layer.highlightedFeature?.mesh === object) {
    setHighlight.setHighlight(state.layer, null);
    state.layer.hoveredFeature = null;
    showFeature.showFeature(state.layer, null);
  };
  disposeMesh.disposeMesh(state.layer, object);
}

export function failTraffic(state, error) {
  state.error = error;
  state.status.textContent = `Error: ${error.message}`;
  state.status.setAttribute('role', 'alert');
  console.error('Traffic layer', error);
}

export function groundTraffic(state) {
  const { layer, lanes } = state;
  const terrain = layer._map._terrain3D?._terrainReady && layer._map._terrain3D, base = layer.root.position[1];
  for (const lane of lanes) lane.points.forEach((point, i) => {
    const elevation = terrain && (lane.elevation ?? getElevation(terrain, lane.latlngs[i]));
    point[2] = Number.isFinite(elevation) && Number.isFinite(base) ? elevation - base : 0;
  });
  state.lanesDirty = true;
  state.nextCheck = -Infinity;
}

export function prepareTraffic(state) {
  const { layer, lanes } = state;
  const crs = layer._map.options.crs, origin = crs.project(layer.location);
  const metres = Math.cos(layer.location.lat * Math.PI / 180);
  for (const lane of lanes) {
    lane.points = lane.latlngs.map(([lat, lng]) => {
      const point = crs.project(new L.LatLng(lat, lng));
      return [(point.x - origin.x) * metres, -(point.y - origin.y) * metres, 0];
    });
    lane.lengths = [0];
    for (let i = 1; i < lane.points.length; i++) {
      lane.lengths.push(lane.lengths[i - 1] + Math.hypot(lane.points[i][0] - lane.points[i - 1][0], lane.points[i][1] - lane.points[i - 1][1]));
    }
    lane.length = lane.lengths.at(-1);
  }
  groundTraffic(state);
  disposeTrafficObject(state, state.route);
  state.route = null;
  state.tripsKey = null;
}

export function drawTrafficRoute(state) {
  state.route = createTrafficMesh(state, routeGeometry(state.lanes), [], { unlit: true });
}

export function rebuildTrafficMesh(state) {
  const { trips, model, vertices } = state;
  disposeTrafficObject(state, state.mesh);
  state.mesh = null;
  if (!trips.length) return;
  const color = trips.flatMap((trip, i) => build(model(i, trip.properties)).color), count = color.length / 3;
  state.mesh = createTrafficMesh(state, { position: color.map(() => 0), normal: color.map(() => 0), color },
    trips.map((trip, i) => ({
      id: trip.id, properties: trip.properties, faceStart: i * vertices / 3, faceEnd: (i + 1) * vertices / 3,
      vertexStart: i * vertices, vertexEnd: (i + 1) * vertices
    })), {}, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC);
  state.mesh.geometry.drawRange.count = count;
  state.mesh.extras.dynamicLights = true;
  trafficBounds(state);
}

export function trafficBounds(state) {
  let radius = 20, height = 5;
  for (let i = 0; i < state.template.position.length; i += 3) {
    radius = Math.max(radius, Math.hypot(state.template.position[i], state.template.position[i + 2]) + Math.abs(state.side));
    height = Math.max(height, state.template.position[i + 1]);
  }
  const extent = { attributes: { position: { data: state.lanes.flatMap(lane => lane.points.flatMap(([x, z, y]) =>
    [x - radius, y, z - radius, x + radius, y + height, z + radius])) } } };
  computeBounds(extent);
  state.mesh.geometry.bounds = extent.bounds;
}

export function destroyTrafficGpu(state) {
  for (const buffer of [state.gpu?.params, state.gpu?.template, state.gpu?.points, state.gpu?.vehicles]) buffer?.destroy();
  state.gpu = null;
}

export function trafficStorage(device, data) {
  const buffer = device.createBuffer({ size: Math.max(16, data.byteLength), usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
  device.queue.writeBuffer(buffer, 0, data);
  return buffer;
}

export function rebaseTraffic(state) {
  const { device } = state.layer.renderer;
  if (state.gpu?.device !== device) {
    destroyTrafficGpu(state);
    state.gpu = {
      device,
      pipeline: device.createComputePipeline({ layout: 'auto', compute: { module: device.createShaderModule({ code: state.shader }), entryPoint: 'main' } }),
      params: device.createBuffer({ size: 16, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST }),
      template: trafficStorage(device, new Float32Array([...state.template.position, ...state.template.normal])),
    };
    state.lanesDirty = true;
  }
  if (state.lanesDirty) {
    const data = new Float32Array(state.lanes.reduce((count, lane) => count + lane.points.length, 0) * 4);
    let offset = 0;
    for (const lane of state.lanes) {
      lane.start = offset / 4;
      lane.points.forEach((point, i) => { data.set([point[0], point[1], point[2], lane.lengths[i]], offset); offset += 4; });
    }
    state.gpu.points?.destroy();
    state.gpu.points = trafficStorage(device, data);
    state.lanesDirty = false;
  }
  const data = new Float32Array(state.trips.length * 4), index = new Uint32Array(data.buffer);
  state.trips.forEach((trip, i) => {
    index[i * 4] = trip.lane.start;
    index[i * 4 + 1] = trip.lane.points.length;
    data[i * 4 + 2] = trip.distance;
    data[i * 4 + 3] = trip.speed;
    state.mesh.extras.featureFaces[i].properties = trip.properties;
  });
  if (state.gpu.vehicles?.size >= data.byteLength) device.queue.writeBuffer(state.gpu.vehicles, 0, data);
  else {
    state.gpu.vehicles?.destroy();
    state.gpu.vehicles = trafficStorage(device, data);
  }
  const { position, normal } = state.mesh.geometry.attributes;
  state.gpu.bindGroup = device.createBindGroup({
    layout: state.gpu.pipeline.getBindGroupLayout(0),
    entries: [state.gpu.params, state.gpu.template, state.gpu.points, state.gpu.vehicles, position.buffer, normal.buffer]
      .map((buffer, binding) => ({ binding, resource: { buffer } })),
  });
}

export function moveTraffic(state, seconds) {
  const { device } = state.gpu;
  state.paramFloats[0] = state.elapsed = seconds;
  state.paramFloats[1] = state.side;
  state.paramInts[2] = state.vertices;
  state.paramInts[3] = state.trips.length * state.vertices;
  device.queue.writeBuffer(state.gpu.params, 0, state.params);
  const encoder = device.createCommandEncoder(), pass = encoder.beginComputePass();
  pass.setPipeline(state.gpu.pipeline);
  pass.setBindGroup(0, state.gpu.bindGroup);
  pass.dispatchWorkgroups(state.trips.length);
  pass.end();
  device.queue.submit([encoder.finish()]);
  state.stale = true;
}

export function locateTraffic(state, trip) {
  const { points, lengths, length } = trip.lane;
  let distance = trip.distance + state.elapsed * trip.speed;
  distance -= length * Math.floor(distance / length);
  const { x, y, z, dx, dz } = along(points, lengths, distance);
  return { x: x - dz * state.side, y, z: z + dx * state.side, dx, dz };
}

export function placeTraffic(state) {
  if (!state.mesh || !state.stale) return;
  state.stale = false;
  const { position, normal } = state.mesh.geometry.attributes;
  state.trips.forEach((trip, i) => {
    const { x: cx, y, z: cz, dx, dz } = locateTraffic(state, trip);
    for (let k = 0, o = i * state.stride; k < state.stride; k += 3, o += 3) {
      const lx = state.template.position[k], lz = state.template.position[k + 2], nx = state.template.normal[k], nz = state.template.normal[k + 2];
      position.data[o] = cx - lx * dz - lz * dx;
      position.data[o + 1] = y + state.template.position[k + 1];
      position.data[o + 2] = cz + lx * dx - lz * dz;
      normal.data[o] = -nx * dz - nz * dx;
      normal.data[o + 1] = state.template.normal[k + 1];
      normal.data[o + 2] = nx * dx - nz * dz;
    }
  });
}

export function tickTraffic(state) {
  state.frame = undefined;
  if (!state.ready || !state.layer._map) return;
  if (!state.layer.renderer) { state.frame = requestAnimationFrame(state.tick); return; }
  if (state.mesh && !(state.mesh.geometry.attributes.position.buffer.usage & GPUBufferUsage.STORAGE)) {
    state.tripsKey = null;
    state.nextCheck = -Infinity;
  }
  const { live, time } = trafficNow(state), ms = time?.getTime(), valid = Number.isFinite(ms);
  let changed = false;
  if (!live || !valid || !(ms >= state.rebasedAt && ms < state.nextCheck)) {
    let text;
    try {
      state.trips = valid ? tripsAt(time, state.lanes, state.velocity) : [];
      text = !valid ? 'Select a valid simulation date' : !state.loaded ? 'Loading…' :
        `${state.trips.length} vehicle${state.trips.length === 1 ? '' : 's'}${state.loaded.note ? ` · ${state.loaded.note}` : ''}`;
    } catch (error) { return failTraffic(state, error); }
    state.rebasedAt = ms;
    state.nextCheck = ms + 1000;
    const key = state.trips.map(trip => trip.id).join();
    changed = key !== state.tripsKey || (state.outline && !state.route && state.lanes.length);
    if (state.outline && !state.route && state.lanes.length) drawTrafficRoute(state);
    if (key !== state.tripsKey) { rebuildTrafficMesh(state); state.tripsKey = key; }
    if (state.mesh) rebaseTraffic(state);
    if (!state.error) {
      if (state.status.textContent !== text) state.status.textContent = text;
      state.status.removeAttribute('role');
    }
  }
  if (state.mesh) moveTraffic(state, (ms - state.rebasedAt) / 1000);
  if (state.mesh && state.lights && (!live || !(performance.now() - state.litAt < 100))) {
    state.litAt = performance.now();
    state.mesh.extras.lights = state.trips.flatMap(trip => {
      const { x, y, z, dx, dz } = locateTraffic(state, trip);
      return state.lights.map(({ position: [lx, ly, lz], ...light }) => ({ ...light, position: [x - lx * dz - lz * dx, y + ly, z + lx * dx - lz * dz] }));
    });
  }
  if (state.mesh || changed) updateScene(state.layer);
  if (live && valid) state.frame = requestAnimationFrame(state.tick);
}

export async function fetchTrafficLanes(state, time, signal) {
  const href = new URL(state.url, document.baseURI).href;
  if (/\.m?js(?:[?#]|$)/i.test(state.url)) return (await import(href)).default(time, state.layer, signal);
  if (!state.file) {
    const response = await fetch(href, { signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.file = await response.json();
  }
  return state.file;
}

export function loadedTrafficLanes(state, signal, data) {
  if (signal.aborted || !state.layer._map) return;
  state.error = null;
  if (data === state.loaded) {
    state.nextCheck = -Infinity;
    if (!state.frame) state.tick();
    return;
  }
  state.loaded = data;
  state.lanes = toLanes(data);
  prepareTraffic(state);
  if (!state.frame) state.tick();
}

export function failedTrafficLoad(state, signal, error) {
  if (!signal.aborted && error.name !== 'AbortError') failTraffic(state, error);
}

export function loadTraffic(state) {
  const { time } = trafficNow(state);
  if (!Number.isFinite(time?.getTime())) return;
  state.request?.abort();
  const { signal } = state.request = new AbortController();
  fetchTrafficLanes(state, time, signal).then(
    loadedTrafficLanes.bind(null, state, signal),
    failedTrafficLoad.bind(null, state, signal),
  );
}

export function updateTraffic(state, event) {
  if (event?.layer && !event.layer.control?.time) return;
  cancelAnimationFrame(state.frame);
  loadTraffic(state);
  state.tick();
}

export function updateTrafficTerrain(state) {
  if (!state.lanes.length) return;
  groundTraffic(state);
  disposeTrafficObject(state, state.route);
  state.route = null;
  if (state.mesh) trafficBounds(state);
  if (!state.frame) state.tick();
}

export function startTraffic(state) {
  state.layer._map.off('simulationtimechange layerremove', state.update).on('simulationtimechange layerremove', state.update);
  state.layer._map.off('terrainchange', state.terrain).on('terrainchange', state.terrain);
  underEntry(state.layer, state.status);
  state.update();
}

export function readyTraffic(state) {
  state.ready = true;
  if (state.layer._map) startTraffic(state);
}

export function addTraffic(state) {
  state.layer._beforeRaycast = placeTraffic.bind(null, state);
  if (state.ready) startTraffic(state);
}

export function removeTraffic(state) {
  state.request?.abort();
  cancelAnimationFrame(state.frame);
  state.frame = undefined;
  state.layer._map.off('simulationtimechange layerremove', state.update).off('terrainchange', state.terrain);
  disposeTrafficObject(state, state.mesh);
  disposeTrafficObject(state, state.route);
  state.mesh = state.route = null;
  delete state.layer._beforeRaycast;
  destroyTrafficGpu(state);
  state.lanes = [];
  state.trips = [];
  state.tripsKey = state.loaded = null;
}
