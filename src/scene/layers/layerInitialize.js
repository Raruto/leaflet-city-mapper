import { indexState } from './constants/indexState.js';
import { init3D } from '../lifecycle/init3D.js';
import { noOperation } from './noOperation.js';
import { ignorePromiseRejection } from './ignorePromiseRejection.js';
import { resolveNextInitialization } from './resolveNextInitialization.js';
import { initializeLayer } from './initializeLayer.js';

export function layerInitialize(options = {}) {
  if (Object.getPrototypeOf(this) !== L.Layer.prototype || !options.source) {
    if (indexState.layerProto.initialize) return indexState.layerProto.initialize.apply(this, arguments);
    L.Util.setOptions(this, options);
    return;
  }
  const {
    source: {
      type = options.source.data?.type === 'FeatureCollection'
        ? 'geojson'
        : /\.pmtiles(?:[?#]|$)/i.test(options.source.url) ? 'pmtiles' : '3d',
      ...source
    },
    ...core
  } = options;
  const settings = { ...source, ...core };
  L.Util.setOptions(this, core);
  this._type = type;
  if (type === '3d') {
    init3D(this, settings);
    return;
  }
  this.onAdd = noOperation;
  this.onRemove = noOperation;
  // ponytail: type methods (setOpacity, add, ...) exist only once `ready` resolves.
  const task = { layer: this, type, settings, ready: null };
  indexState.pendingInitializations.push(task);
  indexState.loading = indexState.loading.catch(ignorePromiseRejection).then(resolveNextInitialization);
  const ready = this.ready = indexState.loading.then(initializeLayer);
  task.ready = ready;
  ready.catch(ignorePromiseRejection);
}
