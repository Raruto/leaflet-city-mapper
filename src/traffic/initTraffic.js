import { state as sharedState } from '../state.js';
import { pluginState } from '../core/pluginState.js';
﻿/**
 * Vehicles moving along GeoJSON lanes; a compute pass places them on the GPU every frame.
 * Source options:
 * - `url`: GeoJSON (Multi)LineStrings, or a JS module whose default export `(time, layer, signal)` returns them (time-dependent data);
 * - `vehicle`: 'car' (default), 'boat', 'bus', 'tram', 'metro', 'bicycle' or 'pedestrian'; `side`: offset right of the lane centreline in metres (vehicle default);
 * - `speed`: m/s of `flow` lanes; `outline`: draw the lanes.
 * Lane properties: `flow` (vehicles/h) or `timetable` (see scheduledTrips.js), optional fixed `elevation`
 * in metres, `name`/`description` for the default tooltip. The status line (count and vehicle type) sits under the layer's entry in the layers control.
 * L.Control.Time on the same map drives the time; without one, vehicles run live.
 */
import { build } from '../geometry/build.js';
import { init3D } from '../scene/init3D.js';
import { tooltip } from './tooltip.js';



import { addTraffic } from './addTraffic.js';
import { placeTraffic } from './placeTraffic.js';
import { removeTraffic } from './removeTraffic.js';
import { readyTraffic } from './readyTraffic.js';
import { tickTraffic } from './tickTraffic.js';
import { updateTraffic } from './updateTraffic.js';
import { updateTrafficTerrain } from './updateTrafficTerrain.js';

export function initTraffic(layer, { url, vehicle = 'car', side, outline, speed: velocity = sharedState.speed, ...options } = sharedState.allocationTrafficEmptyOptions) {
  const { model, lights, side: defaultSide } = sharedState.vehicles[vehicle];
  side ??= defaultSide;
  init3D(layer, /* allocation: required -- Each traffic layer retains its own source and tooltip options. */ {
    tooltip,
    nightLight: Boolean(lights),
    ...options,
  });
  const status = L.DomUtil.create('small', 'traffic-status');
  status.style.cssText = 'display:block;max-width:200px;margin:0 0 4px 20px;color:#555;';
  const template = build(model(0)), stride = template.position.length, vertices = stride / 3;
  const params = /* allocation: required -- Each compute simulation owns its parameter buffer. */ new ArrayBuffer(16);
  const paramFloats = /* allocation: required -- This simulation needs a float view of its own compute parameters. */ new Float32Array(params);
  const paramInts = /* allocation: required -- This simulation needs an integer view of its own compute parameters. */ new Uint32Array(params);
  const state = /* allocation: required -- Each traffic layer owns its asynchronous requests, clock and GPU lifecycle. */ {
    layer, url, model, lights, side, outline, velocity, vehicle, status, template, stride, vertices,
    params, paramFloats, paramInts,
    ready: false, frame: undefined, request: undefined, lanes: /* allocation: required -- Each traffic source owns its mutable lane collection. */ [], tripsKey: undefined,
    mesh: undefined, route: undefined, litAt: -Infinity,
    trips: /* allocation: required -- Each traffic source owns its mutable active-trip collection. */ [], rebasedAt: 0, nextCheck: -Infinity, elapsed: 0, gpu: null,
    lanesDirty: true, stale: false, loaded: undefined, file: undefined,
  };
  // Lane points are [x, z, ground, cumulative length]. Mirrors along() and place().
  state.shader = sharedState.trafficShader;
  state.tick = tickTraffic.bind(null, state);
  state.update = updateTraffic.bind(null, state);
  state.terrain = updateTrafficTerrain.bind(null, state);
  pluginState(layer)._beforeRaycast = placeTraffic.bind(null, state);
  layer.on('ready', readyTraffic.bind(null, state));
  layer.on('add', addTraffic.bind(null, state));
  layer.on('remove', removeTraffic.bind(null, state));
}
