/**
 * Vehicles moving along GeoJSON lanes; a compute pass places them on the GPU every frame.
 * Source options:
 * - `url`: GeoJSON (Multi)LineStrings, or a JS module whose default export `(time, layer, signal)` returns them (time-dependent data);
 * - `vehicle`: 'car' (default) or 'boat'; `side`: offset right of the lane centreline in metres (vehicle default);
 * - `speed`: m/s of `flow` lanes; `outline`: draw the lanes.
 * Lane properties: `flow` (vehicles/h) or `timetable` (see scheduledTrips.js), optional fixed `elevation`
 * in metres, `name`/`description` for the default tooltip. The status line (vehicle count, then the FeatureCollection `note`) sits under the layer's entry in the layers control.
 * The 'sunlight' layer on the same map drives the time; without one, vehicles run live.
 */
import { build } from '../geometry/build.js';
import { tooltip } from './tooltip.js';
import { speed } from './speed.js';
import { vehicles } from './vehicles.js';
import {
  addTraffic,
  placeTraffic,
  removeTraffic,
  readyTraffic,
  tickTraffic,
  updateTraffic,
  updateTrafficTerrain,
} from './traffic.js';

export function initTraffic(layer, { url, vehicle = 'car', side, outline, speed: velocity = speed, ...options } = {}) {
  const { model, lights, side: defaultSide } = vehicles[vehicle];
  side ??= defaultSide;
  layer._init3D({
    tooltip,
    nightLight: Boolean(lights),
    ...options,
  });
  const status = L.DomUtil.create('small', 'traffic-status');
  status.style.cssText = 'display:block;max-width:200px;margin:0 0 4px 20px;color:#555;';
  const template = build(model(0)), stride = template.position.length, vertices = stride / 3;
  const params = new ArrayBuffer(16), paramFloats = new Float32Array(params), paramInts = new Uint32Array(params);
  const state = {
    layer, url, model, lights, side, outline, velocity, status, template, stride, vertices,
    params, paramFloats, paramInts,
    ready: false, frame: undefined, request: undefined, lanes: [], tripsKey: undefined,
    mesh: undefined, route: undefined, litAt: -Infinity,
    trips: [], rebasedAt: 0, nextCheck: -Infinity, elapsed: 0, gpu: null,
    lanesDirty: true, stale: false, loaded: undefined, file: undefined,
  };
  // Lane points are [x, z, ground, cumulative length]. Mirrors along() and place().
  const shader = `
    struct Params { seconds: f32, side: f32, vertices: u32, total: u32 }
    struct Vehicle { start: u32, count: u32, base: f32, speed: f32 }
    @group(0) @binding(0) var<uniform> params: Params;
    @group(0) @binding(1) var<storage, read> model: array<f32>;
    @group(0) @binding(2) var<storage, read> points: array<vec4f>;
    @group(0) @binding(3) var<storage, read> vehicles: array<Vehicle>;
    @group(0) @binding(4) var<storage, read_write> position: array<f32>;
    @group(0) @binding(5) var<storage, read_write> normal: array<f32>;
    @compute @workgroup_size(64)
    fn main(@builtin(global_invocation_id) id: vec3u) {
      let v = id.x;
      if (v >= params.total) { return; }
      let vehicle = vehicles[v / params.vertices];
      let last = vehicle.start + vehicle.count - 1u;
      let length = points[last].w;
      var s = vehicle.base + params.seconds * vehicle.speed;
      s -= length * floor(s / length);
      var i = vehicle.start + 1u;
      while (i < last && points[i].w < s) { i++; }
      let a = points[i - 1u];
      let b = points[i];
      let d = select(b.w - a.w, 1.0, b.w == a.w);
      let t = (s - a.w) / d;
      let dx = (b.x - a.x) / d;
      let dz = (b.y - a.y) / d;
      let cx = a.x + (b.x - a.x) * t - dz * params.side;
      let cz = a.y + (b.y - a.y) * t + dx * params.side;
      let y = a.z + (b.z - a.z) * t;
      let k = (v % params.vertices) * 3u;
      let n = params.vertices * 3u + k;
      let o = v * 3u;
      position[o] = cx - model[k] * dz - model[k + 2u] * dx;
      position[o + 1u] = y + model[k + 1u];
      position[o + 2u] = cz + model[k] * dx - model[k + 2u] * dz;
      normal[o] = -model[n] * dz - model[n + 2u] * dx;
      normal[o + 1u] = model[n + 1u];
      normal[o + 2u] = model[n] * dx - model[n + 2u] * dz;
    }`;
  state.shader = shader;
  state.tick = tickTraffic.bind(null, state);
  state.update = updateTraffic.bind(null, state);
  state.terrain = updateTrafficTerrain.bind(null, state);
  layer._beforeRaycast = placeTraffic.bind(null, state);
  layer.on('ready', readyTraffic.bind(null, state));
  layer.on('add', addTraffic.bind(null, state));
  layer.on('remove', removeTraffic.bind(null, state));
}
