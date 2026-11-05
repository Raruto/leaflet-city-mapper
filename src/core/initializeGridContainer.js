import { state as sharedState } from '../state.js';

export function initializeGridContainer() {
  sharedState.gridInitializers.get(this).call(this);
  this._container.remove();
}
