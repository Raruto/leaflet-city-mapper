import { nativeSetLatLng } from '../methods/nativeSetLatLng.js';
import { nativeSetLatLngs } from '../methods/nativeSetLatLngs.js';
import { nativeAddLatLng } from '../methods/nativeAddLatLng.js';
import { nativeSetRadius } from '../methods/nativeSetRadius.js';
import { nativeSetStyle } from '../methods/nativeSetStyle.js';
import { nativeRedraw } from '../methods/nativeRedraw.js';
import { nativeSetIcon } from '../methods/nativeSetIcon.js';
import { nativeSetUrl } from '../methods/nativeSetUrl.js';
import { nativeSetBounds } from '../methods/nativeSetBounds.js';
import { nativeSetOpacity } from '../methods/nativeSetOpacity.js';
import { nativeSetZIndex } from '../methods/nativeSetZIndex.js';
import { nativeSetZIndexOffset } from '../methods/nativeSetZIndexOffset.js';
import { nativeBringToFront } from '../methods/nativeBringToFront.js';
import { nativeBringToBack } from '../methods/nativeBringToBack.js';

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
