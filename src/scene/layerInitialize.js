import { state as sharedState } from '../state.js';
import { pluginState } from '../core/pluginState.js';

import { init3D } from './init3D.js';
import { noOperation } from '../utils/noOperation.js';
import { resolveNextInitialization } from './resolveNextInitialization.js';
import { initializeLayer } from './initializeLayer.js';

export function layerInitialize(options = sharedState.allocationSceneEmptyOptions) {
  if (Object.getPrototypeOf(this) !== L.Layer.prototype || !options.source) {
    if (sharedState.layerProto.initialize) return sharedState.layerProto.initialize.apply(this, arguments);
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
  const settings = /* allocation: required -- Preserve this layer's source settings across queued initialization. */ { ...source, ...core };
  L.Util.setOptions(this, core);
  pluginState(this)._type = type;
  if (type === '3d') {
    init3D(this, settings);
    return;
  }
  pluginState(this).onAdd = noOperation;
  pluginState(this).onRemove = noOperation;
  // ponytail: type methods (setOpacity, add, ...) exist only once `ready` resolves.
  const task = /* allocation: required -- Keep this layer's queued initialization independent. */ { layer: this, type, settings, ready: null };
  sharedState.pendingInitializations.push(task);
  sharedState.loading = sharedState.loading.catch(noOperation).then(resolveNextInitialization);
  const ready = pluginState(this).ready = sharedState.loading.then(initializeLayer);
  task.ready = ready;
  ready.catch(noOperation);
}
