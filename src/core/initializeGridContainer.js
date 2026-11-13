import { gridInitializers } from '../weakmaps/gridInitializers.js';

/** Run this grid layer's original container initializer and remove its DOM container. */
export function initializeGridContainer() {
  gridInitializers.get(this).call(this);
  this._container.remove();
}
