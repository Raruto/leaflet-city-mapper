export function sortedMvtLevels(levels) {
  const sorted = /* alloc */ [];
  let y, gap = 0, i = 0, j, value, count = 0;
  for (y of levels) sorted.push(y);
  gap = Math.floor(sorted.length / 2);
  for (; gap > 0; gap = Math.floor(gap / 2)) {
    for (i = gap; i < sorted.length; i++) {
      value = sorted[i];
      j = i;
      while (j >= gap && sorted[j - gap] > value) {
        sorted[j] = sorted[j - gap];
        j -= gap;
      }
      sorted[j] = value;
    }
  }
  for (i = 0; i < sorted.length; i++) {
    if (!count || sorted[i] - sorted[count - 1] > 1e-8) sorted[count++] = sorted[i];
  }
  sorted.length = count;
  return sorted;
}
