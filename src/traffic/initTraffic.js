import { L } from '../globals/L.js';
import { speed as sharedSpeed } from '../globals/speed.js';
import { trafficEmptyOptions } from '../globals/trafficEmptyOptions.js';
import { vehicles } from '../globals/vehicles.js';
import { trafficShader } from '../globals/trafficShader.js';
import { trafficByLayer } from '../globals/trafficByLayer.js';


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

export function initTraffic(layer, { url, vehicle = 'car', side, outline, speed: velocity = sharedSpeed, ...options } = trafficEmptyOptions) {
  const { model, lights, side: defaultSide } = vehicles[vehicle];
  side ??= defaultSide;
  init3D(layer, /* alloc */ {
    tooltip,
    nightLight: Boolean(lights),
    ...options,
  });
  const status = L.DomUtil.create('small', 'traffic-status');
  status.style.cssText = 'flex:0 1 auto;padding:1px 5px;border-radius:3px;background:#00000008;color:#555;';
  status.title = vehicle;
  status.textContent = `${vehicle}: loading…`;
  const template = build(model(0)), stride = template.position.length, vertices = stride / 3;
  const params = /* alloc */ new ArrayBuffer(16);
  const paramFloats = /* alloc */ new Float32Array(params);
  const paramInts = /* alloc */ new Uint32Array(params);
  const state = /* alloc */ {
    layer, url, model, lights, side, outline, velocity, vehicle, status, template, stride, vertices,
    params, paramFloats, paramInts,
    ready: false, frame: undefined, request: undefined, lanes: /* alloc */ [], tripsKey: undefined,
    mesh: undefined, route: undefined, litAt: -Infinity,
    trips: /* alloc */ [], rebasedAt: 0, nextCheck: -Infinity, elapsed: 0, gpu: null,
    lanesDirty: true, stale: false, loaded: undefined, file: undefined,
  };
  // Lane points are [x, z, ground, cumulative length]. Mirrors along() and place().
  state.shader = trafficShader;
  state.tick = tickTraffic.bind(null, state);
  state.update = updateTraffic.bind(null, state);
  state.terrain = updateTrafficTerrain.bind(null, state);
  trafficByLayer.set(layer, state);
  layer.on('ready', readyTraffic.bind(null, state));
  layer.on('add', addTraffic.bind(null, state));
  layer.on('remove', removeTraffic.bind(null, state));
}
