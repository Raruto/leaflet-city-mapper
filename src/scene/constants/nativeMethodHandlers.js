import { nativeSetLatLng } from '../nativeSetLatLng.js';
import { nativeSetLatLngs } from '../nativeSetLatLngs.js';
import { nativeAddLatLng } from '../nativeAddLatLng.js';
import { nativeSetRadius } from '../nativeSetRadius.js';
import { nativeSetStyle } from '../nativeSetStyle.js';
import { nativeRedraw } from '../nativeRedraw.js';
import { nativeSetIcon } from '../nativeSetIcon.js';
import { nativeSetUrl } from '../nativeSetUrl.js';
import { nativeSetBounds } from '../nativeSetBounds.js';
import { nativeSetOpacity } from '../nativeSetOpacity.js';
import { nativeSetZIndex } from '../nativeSetZIndex.js';
import { nativeSetZIndexOffset } from '../nativeSetZIndexOffset.js';
import { nativeBringToFront } from '../nativeBringToFront.js';
import { nativeBringToBack } from '../nativeBringToBack.js';

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
