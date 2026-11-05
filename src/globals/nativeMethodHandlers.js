import { nativeSetLatLng } from '../core/nativeSetLatLng.js';
import { nativeSetLatLngs } from '../core/nativeSetLatLngs.js';
import { nativeAddLatLng } from '../core/nativeAddLatLng.js';
import { nativeSetRadius } from '../core/nativeSetRadius.js';
import { nativeSetStyle } from '../core/nativeSetStyle.js';
import { nativeRedraw } from '../core/nativeRedraw.js';
import { nativeSetIcon } from '../core/nativeSetIcon.js';
import { nativeSetUrl } from '../core/nativeSetUrl.js';
import { nativeSetBounds } from '../core/nativeSetBounds.js';
import { nativeSetOpacity } from '../core/nativeSetOpacity.js';
import { nativeSetZIndex } from '../core/nativeSetZIndex.js';
import { nativeSetZIndexOffset } from '../core/nativeSetZIndexOffset.js';
import { nativeBringToFront } from '../core/nativeBringToFront.js';
import { nativeBringToBack } from '../core/nativeBringToBack.js';

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
