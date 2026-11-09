export function mergeMvtActiveEdges(active, sorted, left, mid, right) {
  let i = left, j = mid, k = left;
  while (i < mid && j < right) {
    if (active[j].x < active[i].x) sorted[k++] = active[j++];
    else sorted[k++] = active[i++];
  }
  while (i < mid) sorted[k++] = active[i++];
  while (j < right) sorted[k++] = active[j++];
}
