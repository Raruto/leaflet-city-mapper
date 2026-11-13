/**
 * Order vector labels by ascending priority value.
 *
 * @param {Object} a First label.
 * @param {Object} b Second label.
 *
 * @returns {number} Relative order of the labels.
 */
export function compareVectorLabelPriority(a, b) {
  return a.priority - b.priority;
}
