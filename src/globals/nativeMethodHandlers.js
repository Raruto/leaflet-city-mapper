import { nativeSetLatLng } from '../native/nativeSetLatLng.js';
import { nativeSetLatLngs } from '../native/nativeSetLatLngs.js';
import { nativeAddLatLng } from '../native/nativeAddLatLng.js';
import { nativeSetRadius } from '../native/nativeSetRadius.js';
import { nativeSetStyle } from '../native/nativeSetStyle.js';
import { nativeRedraw } from '../native/nativeRedraw.js';
import { nativeSetIcon } from '../native/nativeSetIcon.js';
import { nativeSetUrl } from '../native/nativeSetUrl.js';
import { nativeSetBounds } from '../native/nativeSetBounds.js';
import { nativeSetOpacity } from '../native/nativeSetOpacity.js';
import { nativeSetZIndex } from '../native/nativeSetZIndex.js';
import { nativeSetZIndexOffset } from '../native/nativeSetZIndexOffset.js';
import { nativeBringToFront } from '../native/nativeBringToFront.js';
import { nativeBringToBack } from '../native/nativeBringToBack.js';

/**
 * Native layer method wrappers indexed by the Leaflet method they replace.
 *
 * @type {Object<string, Function>}
 */
export const nativeMethodHandlers = {
  setLatLng: nativeSetLatLng,
  setLatLngs: nativeSetLatLngs,
  addLatLng: nativeAddLatLng,
  setRadius: nativeSetRadius,
  setStyle: nativeSetStyle,
  redraw: nativeRedraw,
  setIcon: nativeSetIcon,
  setUrl: nativeSetUrl,
  setBounds: nativeSetBounds,
  setOpacity: nativeSetOpacity,
  setZIndex: nativeSetZIndex,
  setZIndexOffset: nativeSetZIndexOffset,
  bringToFront: nativeBringToFront,
  bringToBack: nativeBringToBack,
};
