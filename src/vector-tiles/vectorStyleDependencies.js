/**
 * Collect feature property names referenced by paint and filter expressions.
 *
 * @param {Object} entry Style layer entry.
 *
 * @returns {Set<string>} Referenced property names.
 */
export function vectorStyleDependencies(entry) {
  const dependencies = /* alloc */ new Set();
  const expressions = /* alloc */ [entry.paint, entry.filter];
  let value, child;
  while (expressions.length) {
    value = expressions.pop();
    if (!value || typeof value !== 'object') continue;
    if (Array.isArray(value) && typeof value[1] === 'string' &&
        /* alloc */ ['get', 'has', '==', '!=', '<', '>', '<=', '>=', 'in', '!in'].includes(value[0])) {
      dependencies.add(value[1]);
    }
    for (child of Object.values(value)) expressions.push(child);
  }
  return dependencies;
}
