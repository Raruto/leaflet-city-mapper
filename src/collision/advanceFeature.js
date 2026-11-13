/**
 * Advance a feature index past the feature ranges that end at or before a face.
 *
 * @param {Object[]|undefined} ranges Feature metadata with faceEnd offsets.
 * @param {number} feature Current feature index.
 * @param {number} face Face index.
 *
 * @returns {number} Feature index containing the face.
 */
export function advanceFeature(ranges, feature, face) {
  while (ranges && feature < ranges.length && face >= ranges[feature].faceEnd) feature++;
  return feature;
}
