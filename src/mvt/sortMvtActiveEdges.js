import { mergeMvtActiveEdges } from './mergeMvtActiveEdges.js';

export function sortMvtActiveEdges(active) {
  const sorted = /* alloc */ new Array(active.length);
  let width = 1, left, mid, right, i;
  while (width < active.length) {
    for (left = 0; left < active.length; left += width * 2) {
      mid = Math.min(left + width, active.length);
      right = Math.min(left + width * 2, active.length);
      mergeMvtActiveEdges(active, sorted, left, mid, right);
    }
    for (i = 0; i < active.length; i++) active[i] = sorted[i];
    width *= 2;
  }
}
