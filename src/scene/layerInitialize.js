import { kindByLayer } from '../weakmaps/kindByLayer.js';
import { readyByLayer } from '../weakmaps/readyByLayer.js';
import { sceneLayers } from '../weakmaps/sceneLayers.js';
import { typeByLayer } from '../weakmaps/typeByLayer.js';
import { mutateWeakMap } from '../weakmaps/mutateWeakMap.js';

import { L } from '../globals/L.js';
import { sceneEmptyOptions } from '../globals/sceneEmptyOptions.js';
import { layerProto } from '../globals/layerProto.js';
import { pendingInitializations } from '../globals/pendingInitializations.js';
import { loading } from '../globals/loading.js';



import { init3D } from './init3D.js';
import { noOperation } from '../utils/noOperation.js';
import { resolveNextInitialization } from './resolveNextInitialization.js';
import { initializeLayer } from './initializeLayer.js';

export function layerInitialize(options = sceneEmptyOptions) {
  if (!sceneLayers.has(this)) {
    sceneLayers.add(this);
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
        : /\.pmtiles(?:[?#]|$)/i.test(options.source.url) ? 'pmtiles'
        : /\.tiff?(?:[?#]|$)/i.test(options.source.url) ? 'cog' : '3d',
      ...source
    },
    ...core
  } = options;
  const settings = /* alloc */ { ...source, ...core };
  L.Util.setOptions(this, core);
  mutateWeakMap(typeByLayer, this, "=", type);
  if (type === '3d') {
    init3D(this, settings);
    return;
  }
  mutateWeakMap(kindByLayer, this, "=", 'pending');
  const task = /* alloc */ { layer: this, type, settings, ready: null };
  pendingInitializations.push(task);
  loading.value = loading.value.catch(noOperation).then(resolveNextInitialization);
  const ready = mutateWeakMap(readyByLayer, this, "=", loading.value.then(initializeLayer));
  task.ready = ready;
  ready.catch(noOperation);
}
