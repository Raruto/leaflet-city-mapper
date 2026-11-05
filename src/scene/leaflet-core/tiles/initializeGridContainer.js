import { indexState } from '../../layers/constants/indexState.js';

export function initializeGridContainer() {
  indexState.gridInitializers.get(this).call(this);
  this._container.remove();
}
