import { gridInitializers } from '../globals/gridInitializers.js';


export function initializeGridContainer() {
  gridInitializers.get(this).call(this);
  this._container.remove();
}
