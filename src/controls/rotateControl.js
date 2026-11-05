import { L } from '../globals/L.js';
export function rotateControl(options) {
  return /* allocation: required -- Factory callers own independent removable native controls. */ new L.Control.Rotate(options);
}
