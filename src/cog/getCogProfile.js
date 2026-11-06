import { validCogDimensions } from './validCogDimensions.js';
import { validCogEncoding } from './validCogEncoding.js';

export function getCogProfile(tags) {
  const width = tags.get(256)?.[0], height = tags.get(257)?.[0], samples = tags.get(277)?.[0] ?? 1;
  const bits = tags.get(258), format = tags.get(339) || /* alloc */ [1];
  let bytes = true, unsigned = true, floating = true, value;
  for (value of bits || /* alloc */ []) bytes &&= value === 8;
  for (value of format) { unsigned &&= value === 1; floating &&= value === 3; }
  const elevation = samples === 1 && bits?.length === 1 && bits[0] === 32 && floating;
  if (!validCogDimensions(tags, width, height) ||
    !validCogEncoding(tags, samples, bits, format, elevation, bytes, unsigned)) {
    throw /* alloc */ new Error('Unsupported COG profile: expected tiled 256px RGB(A) Uint8 or Float32, DEFLATE without predictor');
  }
  return /* alloc */ { width, height, samples, elevation };
}
