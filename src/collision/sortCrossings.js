/**
 * Insertion-sort hit pairs in place by feature key, then distance.
 *
 * @param {number[]} hits Flat feature key and crossing distance pairs.
 */
export function sortCrossings(hits) {
  let ix, j, feature, distance;
  for (ix = 2; ix < hits.length; ix += 2) {
    feature = hits[ix], distance = hits[ix + 1];
    j = ix - 2;
    while (j >= 0 && (hits[j] > feature || (hits[j] === feature && hits[j + 1] > distance))) {
      hits[j + 2] = hits[j], hits[j + 3] = hits[j + 1];
      j -= 2;
    }
    hits[j + 2] = feature, hits[j + 3] = distance;
  }
}
