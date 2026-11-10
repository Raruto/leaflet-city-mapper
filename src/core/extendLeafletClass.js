import { L } from '../globals/L.js';

export function extendLeafletClass(parent) {
  return L.version.startsWith('2.') ? parent : parent.extend(/* alloc */ {});
}
