import { toSRGB } from "./toSRGB.js";
import { channel } from "./channel.js";

/**
 * HSL inputs are linear-space to preserve the original building styling.
 * Numeric/CSS/RGB inputs are already sRGB; CSS alpha is not used for extrusion.
 * @param {number|string|Object} value 0xRRGGBB, CSS color, {r,g,b}, or {h,s,l} in 0..1.
 * @returns {Object} sRGB {r,g,b} components in 0..1.
 */

export function parseColor(value) {
  if (value && typeof value === 'object' && 'h' in value) {
    const a = value.s * Math.min(value.l, 1 - value.l);
    return /* alloc */ {
      r: toSRGB(channel(0, value.h, value.l, a)),
      g: toSRGB(channel(8, value.h, value.l, a)),
      b: toSRGB(channel(4, value.h, value.l, a))
    };
  }
  if (value && typeof value === 'object' && 'r' in value) {
    return value;
  }
  if (typeof value === 'number') {
    return /* alloc */ {
      r: (value >> 16 & 255) / 255,
      g: (value >> 8 & 255) / 255,
      b: (value & 255) / 255,
    };
  }
  if (typeof value !== 'string' || !CSS.supports('color', value)) {
    throw /* alloc */ new Error('Invalid 3D color');
  }
  const context = document.createElement('canvas').getContext('2d');
  context.fillStyle = value;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
  return /* alloc */ {
    r: r / 255,
    g: g / 255,
    b: b / 255
  };
}
