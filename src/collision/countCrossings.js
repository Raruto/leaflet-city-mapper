/**
 * Count features enclosing the ray origin, deduplicating crossings separately for each feature and footprint.
 *
 * @param {number[]} hits Feature keys and crossing distances; sorted in place.
 * @param {Object[]|undefined} ranges Feature metadata, including polygon flags.
 *
 * @returns {number} Number of features classified as enclosing the origin.
 */
export function countCrossings(hits, ranges) {
  // Shared walls must be deduplicated within each feature, not across neighboring features.
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
  let crossings = 0, enclosed = 0, previous = -Infinity, previousKey = -1, previousFeature = -1, height = 0, footprint = 0, key;
  for (ix = 0; ix <= hits.length; ix += 2) {
    key = ix < hits.length ? hits[ix] : -1;
    feature = Math.floor(key / 2);
    if (key !== previousKey) {
      if (previousKey >= 0) {
        if (previousKey % 2) footprint = crossings % 2;
        else height = crossings % 2;
        if (feature !== previousFeature) {
          if (height && (!ranges?.[previousFeature]?.polygon || footprint)) enclosed++;
          height = 0, footprint = 0;
        }
      }
      crossings = 0, previous = -Infinity, previousKey = key, previousFeature = feature;
    }
    if (ix === hits.length) break;
    distance = hits[ix + 1];
    if (distance - previous > (key % 2 ? 1e-3 : 1e-4)) crossings++;
    previous = distance;
  }
  return enclosed;
}
