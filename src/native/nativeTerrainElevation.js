import { terrainElevation } from '../terrain/terrainElevation.js';
import { nativeTerrainRequest } from './nativeTerrainRequest.js';

/**
 * Sample the finest rendered native terrain, including retained zoom levels.
 *
 * @param {Object} state Terrain stream state.
 * @param {Object} location Geographic location to sample.
 *
 * @returns {number|null} Elevation, or null if no rendered sample is available.
 */
export function nativeTerrainElevation(state, location) {
  const selected = nativeTerrainRequest(state, location);
  if (!selected) return null;
  const { x, y, z } = selected.tile.coords;
  const point = state.map.project(location, z);
  const col = Math.max(0, Math.min(31, Math.floor((point.x - x * 256) / 8)));
  const row = Math.max(0, Math.min(31, Math.floor((point.y - y * 256) / 8)));
  const u = (point.x - x * 256 - col * 8) / 8;
  const v = (point.y - y * 256 - row * 8) / 8;
  const a = terrainElevation(/* alloc */ { x: x * 256 + col * 8, y: y * 256 + row * 8 }, selected.tiles);
  const b = terrainElevation(/* alloc */ { x: x * 256 + (col + 1) * 8, y: y * 256 + row * 8 }, selected.tiles);
  const c = terrainElevation(/* alloc */ { x: x * 256 + col * 8, y: y * 256 + (row + 1) * 8 }, selected.tiles);
  const d = terrainElevation(/* alloc */ { x: x * 256 + (col + 1) * 8, y: y * 256 + (row + 1) * 8 }, selected.tiles);
  if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c) || !Number.isFinite(d)) return null;
  return u + v <= 1 ? a * (1 - u - v) + b * u + c * v :
    b * (1 - v) + c * (1 - u) + d * (u + v - 1);
}
