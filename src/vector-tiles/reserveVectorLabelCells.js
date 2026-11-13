/**
 * Reserve label cells only if none are already occupied.
 *
 * @param {Iterable<string>} cells Cells required by the label.
 * @param {Set<string>} occupied Previously occupied cells.
 *
 * @returns {boolean} Whether the cells were reserved.
 */
export function reserveVectorLabelCells(cells, occupied) {
  let cell;
  for (cell of cells) if (occupied.has(cell)) return false;
  for (cell of cells) occupied.add(cell);
  return true;
}
