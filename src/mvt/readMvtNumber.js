import { readMvtInteger } from './readMvtInteger.js';

export function readMvtNumber(reader) {
  const value = readMvtInteger(reader);
  if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw /* alloc */ new Error('MVT integer exceeds safe range');
  }
  return Number(value);
}
