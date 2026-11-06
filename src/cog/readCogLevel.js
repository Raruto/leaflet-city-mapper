import { getCogProfile } from './getCogProfile.js';
import { getCogBase } from './getCogBase.js';
import { validCogGrid } from './validCogGrid.js';
import { validateCogOffsets } from './validateCogOffsets.js';

export function readCogLevel(source, directory, state) {
  const tags = directory.tags, profile = getCogProfile(tags);
  if (!state.base) state.base = getCogBase(tags, profile.width, profile.height, profile.elevation);
  const base = state.base, resolution = base.resolution * base.width / profile.width;
  const zoom = Math.round(Math.log2(20037508.342789244 * 2 / (256 * resolution)));
  const span = 20037508.342789244 * 2 / 2 ** zoom;
  let x = (base.left + 20037508.342789244) / span;
  let y = (20037508.342789244 - base.top) / span;
  if (Math.abs(x - Math.round(x)) < 1e-6) x = Math.round(x);
  if (Math.abs(y - Math.round(y)) < 1e-6) y = Math.round(y);
  if (!validCogGrid(source, base, profile, zoom, x, y, resolution)) {
    throw /* alloc */ new Error('COG levels must align with the Web Mercator XYZ tile grid');
  }
  const level = /* alloc */ {
    x, y, columns: profile.width / 256, rows: profile.height / 256, samples: profile.samples,
    elevation: profile.elevation, compression: tags.get(259)[0], offsets: tags.get(324), lengths: tags.get(325),
  };
  validateCogOffsets(source, level);
  source.levels.set(zoom, level);
  state.minZoom = Math.min(state.minZoom, zoom);
  state.maxZoom = Math.max(state.maxZoom, zoom);
}
