export function countCrossings(hits) {
  let ix, j, distance;
  for (ix = 1; ix < hits.length; ix++) {
    distance = hits[ix];
    j = ix - 1;
    while (j >= 0 && hits[j] > distance) hits[j + 1] = hits[j--];
    hits[j + 1] = distance;
  }
  let crossings = 0, previous = -Infinity;
  for (distance of hits) {
    if (distance - previous > 1e-4) crossings++;
    previous = distance;
  }
  return crossings;
}
