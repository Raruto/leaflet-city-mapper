export function reserveVectorLabelCells(cells, occupied) {
  let cell;
  for (cell of cells) if (occupied.has(cell)) return false;
  for (cell of cells) occupied.add(cell);
  return true;
}
