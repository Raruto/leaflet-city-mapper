export function box(x0, x1, z0, z1) {
  return /* alloc */ [
    /* alloc */ [x0, z0],
    /* alloc */ [x1, z0],
    /* alloc */ [x1, z1],
    /* alloc */ [x0, z1],
  ];
}
