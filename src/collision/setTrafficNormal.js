export function setTrafficNormal(data, x, z, distance, dx, dz) {
  if (distance < 1e-6) {
    data.normal[0] = -dx;
    data.normal[1] = -dz;
  } else {
    data.normal[0] = x / distance;
    data.normal[1] = z / distance;
  }
}
