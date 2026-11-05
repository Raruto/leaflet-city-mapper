export function box(x0, x1, z0, z1) {
  return /* allocation: required -- Each caller owns an editable footprint ring. */ [
    /* allocation: required -- The footprint retains an independent first corner. */ [x0, z0],
    /* allocation: required -- The footprint retains an independent second corner. */ [x1, z0],
    /* allocation: required -- The footprint retains an independent third corner. */ [x1, z1],
    /* allocation: required -- The footprint retains an independent fourth corner. */ [x0, z1],
  ];
}
