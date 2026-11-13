import { addedByLayer } from '../weakmaps/addedByLayer.js';
import { geojsonByLayer } from '../weakmaps/geojsonByLayer.js';
import { groupByLayer } from '../weakmaps/groupByLayer.js';
import { headerByLayer } from '../weakmaps/headerByLayer.js';
import { modelUrlByLayer } from '../weakmaps/modelUrlByLayer.js';
import { raycasterByLayer } from '../weakmaps/raycasterByLayer.js';
import { rootByLayer } from '../weakmaps/rootByLayer.js';
import { sharedByLayer } from '../weakmaps/sharedByLayer.js';
import { urlByLayer } from '../weakmaps/urlByLayer.js';
import { emptyNode } from './createSceneNode.js';
import { getHeader } from '../archives/getHeader.js';
import { attach } from './attachSharedScene.js';
import { loadModel } from '../models/loadModel.js';
import { update } from './scheduleSceneUpdate.js';

/**
 * Initialize a 3D scene root and source, attach if mapped, and emit readiness.
 *
 * @param {L.Layer} layer 3D layer to initialize.
 *
 * @returns {Promise<L.Layer>} The initialized layer.
 *
 * @throws {Error} If initialization fails, after emitting an error event.
 */
export async function ready3D(layer) {
  try {
    rootByLayer.set(layer, emptyNode());
    raycasterByLayer.set(layer, /* alloc */ {
      origin: /* alloc */ [0, 0, 0],
      direction: /* alloc */ [0, 0, 0],
      inverse: /* alloc */ new DOMMatrix(),
      meshes: /* alloc */ [],
    });
    if (urlByLayer.get(layer) || geojsonByLayer.get(layer)) {
      groupByLayer.set(layer, rootByLayer.get(layer));
      if (urlByLayer.get(layer)) headerByLayer.set(layer, await getHeader(layer));
    }
    if (layer._map) {
      await attach(layer, layer._map);
      addedByLayer.get(layer).resolve();
    }
    if (modelUrlByLayer.get(layer)) await loadModel(layer);
    if (sharedByLayer.get(layer)) update(layer);
    layer.fire('ready');
    return layer;
  } catch (error) {
    layer.fire('error', /* alloc */ { error });
    throw error;
  }
}
