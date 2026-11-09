import { readMvtNumber } from './readMvtNumber.js';

export function readMvtField(reader) {
  const tag = readMvtNumber(reader);
  const field = Math.floor(tag / 8), wire = tag % 8;
  if (!field || field > 536870911) throw /* alloc */ new Error('Invalid MVT field number');
  return /* alloc */ [field, wire];
}
