export function hasCogProjection(keys) {
  let projected = false, area = false, i;
  if (keys) for (i = 4; i < keys.length; i += 4) {
    if (keys[i + 1] !== 0 || keys[i + 2] !== 1) continue;
    if (keys[i] === 3072 && keys[i + 3] === 3857) projected = true;
    if (keys[i] === 1025 && keys[i + 3] === 1) area = true;
  }
  return projected && area;
}
