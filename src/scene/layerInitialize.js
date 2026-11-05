import { L } from '../globals/L.js';
import { sceneEmptyOptions } from '../globals/sceneEmptyOptions.js';
import { layerProto } from '../globals/layerProto.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';
import { pendingInitializations } from '../globals/pendingInitializations.js';
import { loading } from '../globals/loading.js';



import { init3D } from './init3D.js';
import { noOperation } from '../utils/noOperation.js';
import { resolveNextInitialization } from './resolveNextInitialization.js';
import { initializeLayer } from './initializeLayer.js';

export function layerInitialize(options = sceneEmptyOptions) {
  if (!sceneByLayer.has(this)) {
    sceneByLayer.set(this, /* allocation: required -- Native construction owns independent scene data before init hooks run. */ {});
  }
  if (Object.getPrototypeOf(this) !== L.Layer.prototype || !options?.source) {
    if (layerProto.value.initialize) return layerProto.value.initialize.apply(this, arguments);
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
  sceneByLayer.get(this)._type = type;
  if (type === '3d') {
    init3D(this, settings);
    return;
  }
  sceneByLayer.get(this).kind = 'pending';
  const task = /* allocation: required -- Keep this layer's queued initialization independent. */ { layer: this, type, settings, ready: null };
  pendingInitializations.push(task);
  loading.value = loading.value.catch(noOperation).then(resolveNextInitialization);
  const ready = sceneByLayer.get(this).ready = loading.value.then(initializeLayer);
  task.ready = ready;
  ready.catch(noOperation);
}
