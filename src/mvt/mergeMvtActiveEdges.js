/**
 * Stably merge two sorted active-edge ranges into a destination array.
 *
 * @param {Array<Object>} active Source active edges.
 * @param {Array<Object>} sorted Destination array.
 * @param {number} left Start of the first range.
 * @param {number} mid Boundary between ranges.
 * @param {number} right Exclusive end of the second range.
 */
export function mergeMvtActiveEdges(active, sorted, left, mid, right) {
  let i = left, j = mid, k = left;
  while (i < mid && j < right) {
    if (active[j].x < active[i].x) sorted[k++] = active[j++];
    else sorted[k++] = active[i++];
  }
  while (i < mid) sorted[k++] = active[i++];
  while (j < right) sorted[k++] = active[j++];
}
