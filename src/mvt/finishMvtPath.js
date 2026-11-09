export function finishMvtPath(path, type, closed) {
  if (path && (type === 2 && path.length < 2 || type === 3 && !closed)) {
    throw /* alloc */ new Error('Incomplete MVT geometry');
  }
}
