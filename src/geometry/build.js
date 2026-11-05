import { triangle } from './triangle.js';

export function build(parts) {
  const position = /* allocation: required -- Each built mesh owns its position data. */ [];
  const normal = /* allocation: required -- Each built mesh owns its normal data. */ [];
  const color = /* allocation: required -- Each built mesh owns its color data. */ [];
  const low = /* allocation: required -- Lower ring work stays private to this build invocation. */ [];
  const high = /* allocation: required -- Upper ring work stays private to this build invocation. */ [];
  let ring, bottom, top, tint, topRing, x, z, i, j;
  for ([ring, bottom, top, tint, topRing = ring] of parts) {
    low.length = high.length = 0;
    for ([x, z] of ring) low.push(/* allocation: required -- The lower ring retains distinct vertices until its faces are emitted. */ [x, bottom, z]);
    for ([x, z] of topRing) high.push(/* allocation: required -- The upper ring retains distinct vertices until its faces are emitted. */ [x, top, z]);
    for (i = 0; i < ring.length; i++) {
      j = (i + 1) % ring.length;
      triangle(position, normal, color, low[i], low[j], high[j], tint); triangle(position, normal, color, low[i], high[j], high[i], tint);
    }
    for (i = 1; i < ring.length - 1; i++) {
      triangle(position, normal, color, high[0], high[i], high[i + 1], tint); triangle(position, normal, color, low[0], low[i + 1], low[i], tint);
    }
  }
  return /* allocation: required -- The caller retains this mesh attribute bundle. */ { position, normal, color };
}
