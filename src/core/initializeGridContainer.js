import { gridInitializers } from '../weakmaps/gridInitializers.js';


export function initializeGridContainer() {
  gridInitializers.get(this).call(this);
  this._container.remove();
}
