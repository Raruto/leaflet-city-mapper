import { addedByLayer } from './addedByLayer.js';
import { archiveHeaderByLayer } from './archiveHeaderByLayer.js';
import { areasByLayer } from './areasByLayer.js';
import { bridgeMeshByLayer } from './bridgeMeshByLayer.js';
import { bridgesByLayer } from './bridgesByLayer.js';
import { cameraByLayer } from './cameraByLayer.js';
import { cameraZIndexOffsetByLayer } from './cameraZIndexOffsetByLayer.js';
import { containerByLayer } from './containerByLayer.js';
import { controlByLayer } from './controlByLayer.js';
import { countStatusByLayer } from './countStatusByLayer.js';
import { cursorByLayer } from './cursorByLayer.js';
import { demByLayer } from './demByLayer.js';
import { directoriesByLayer } from './directoriesByLayer.js';
import { etagByLayer } from './etagByLayer.js';
import { eventMapByLayer } from './eventMapByLayer.js';
import { eventsByLayer } from './eventsByLayer.js';
import { fadeFrameByLayer } from './fadeFrameByLayer.js';
import { fadeVersionByLayer } from './fadeVersionByLayer.js';
import { frameByLayer } from './frameByLayer.js';
import { geojsonByLayer } from './geojsonByLayer.js';
import { groupByLayer } from './groupByLayer.js';
import { headerByLayer } from './headerByLayer.js';
import { highlightedFeatureByLayer } from './highlightedFeatureByLayer.js';
import { hoveredFeatureByLayer } from './hoveredFeatureByLayer.js';
import { inflightByLayer } from './inflightByLayer.js';
import { kindByLayer } from './kindByLayer.js';
import { layersByLayer } from './layersByLayer.js';
import { loadingTilesByLayer } from './loadingTilesByLayer.js';
import { locationByLayer } from './locationByLayer.js';
import { modelByLayer } from './modelByLayer.js';
import { modelUrlByLayer } from './modelUrlByLayer.js';
import { nativeGPUByLayer } from './nativeGPUByLayer.js';
import { pointerEventsByLayer } from './pointerEventsByLayer.js';
import { pruneAfterByLayer } from './pruneAfterByLayer.js';
import { pruneVersionByLayer } from './pruneVersionByLayer.js';
import { pruneWantedByLayer } from './pruneWantedByLayer.js';
import { queuedByLayer } from './queuedByLayer.js';
import { rasterGeometryByLayer } from './rasterGeometryByLayer.js';
import { rasterProgramByLayer } from './rasterProgramByLayer.js';
import { rasterTilesByLayer } from './rasterTilesByLayer.js';
import { rasterVersionByLayer } from './rasterVersionByLayer.js';
import { raycasterByLayer } from './raycasterByLayer.js';
import { readyByLayer } from './readyByLayer.js';
import { rendererByLayer } from './rendererByLayer.js';
import { rendererReadyByLayer } from './rendererReadyByLayer.js';
import { roofRasterByLayer } from './roofRasterByLayer.js';
import { roofRastersByLayer } from './roofRastersByLayer.js';
import { rootByLayer } from './rootByLayer.js';
import { sceneByLayer } from './sceneByLayer.js';
import { sceneOriginByLayer } from './sceneOriginByLayer.js';
import { shadowMeshesByLayer } from './shadowMeshesByLayer.js';
import { sharedByLayer } from './sharedByLayer.js';
import { sizeByLayer } from './sizeByLayer.js';
import { state3dByLayer } from './state3dByLayer.js';
import { terrain3DByLayer } from './terrain3DByLayer.js';
import { terrainArchiveByLayer } from './terrainArchiveByLayer.js';
import { terrainBaseYByLayer } from './terrainBaseYByLayer.js';
import { terrainBoundsByLayer } from './terrainBoundsByLayer.js';
import { terrainControllerByLayer } from './terrainControllerByLayer.js';
import { terrainGridsByLayer } from './terrainGridsByLayer.js';
import { terrainLoadingByLayer } from './terrainLoadingByLayer.js';
import { terrainOriginElevationByLayer } from './terrainOriginElevationByLayer.js';
import { terrainPromiseByLayer } from './terrainPromiseByLayer.js';
import { terrainReadyByLayer } from './terrainReadyByLayer.js';
import { terrainRequestByLayer } from './terrainRequestByLayer.js';
import { terrainSourceByLayer } from './terrainSourceByLayer.js';
import { terrainTilesByLayer } from './terrainTilesByLayer.js';
import { terrainZoomByLayer } from './terrainZoomByLayer.js';
import { tileZoomByLayer } from './tileZoomByLayer.js';
import { tooltipByLayer } from './tooltipByLayer.js';
import { typeByLayer } from './typeByLayer.js';
import { urlByLayer } from './urlByLayer.js';
import { visibleMeshesByLayer } from './visibleMeshesByLayer.js';
import { walkerByLayer } from './walkerByLayer.js';
import { wantedRasterTilesByLayer } from './wantedRasterTilesByLayer.js';
import { zoomLevelByLayer } from './zoomLevelByLayer.js';
import { zoomTransitionsByLayer } from './zoomTransitionsByLayer.js';
import { zoomViewByLayer } from './zoomViewByLayer.js';

/**
 * Index scene state maps by their lifecycle and compatibility field names.
 *
 * @type {Object<string, WeakMap>}
 */
export const sceneFields = {
  "_3d": state3dByLayer,
  "_added": addedByLayer,
  "_areas": areasByLayer,
  "_bridgeMesh": bridgeMeshByLayer,
  "_bridges": bridgesByLayer,
  "_cameraZIndexOffset": cameraZIndexOffsetByLayer,
  "_countStatus": countStatusByLayer,
  "_cursor": cursorByLayer,
  "_dem": demByLayer,
  "_directories": directoriesByLayer,
  "_etag": etagByLayer,
  "_fadeFrame": fadeFrameByLayer,
  "_fadeVersion": fadeVersionByLayer,
  "_frame": frameByLayer,
  "_geojson": geojsonByLayer,
  "_header": archiveHeaderByLayer,
  "_inflight": inflightByLayer,
  "_layers": layersByLayer,
  "_loadingTiles": loadingTilesByLayer,
  "_nativeGPU": nativeGPUByLayer,
  "_pointerEvents": pointerEventsByLayer,
  "_pruneAfter": pruneAfterByLayer,
  "_pruneVersion": pruneVersionByLayer,
  "_pruneWanted": pruneWantedByLayer,
  "_queued": queuedByLayer,
  "_rasterGeometry": rasterGeometryByLayer,
  "_rasterProgram": rasterProgramByLayer,
  "_rasterTiles": rasterTilesByLayer,
  "_rasterVersion": rasterVersionByLayer,
  "_rendererReady": rendererReadyByLayer,
  "_roofRaster": roofRasterByLayer,
  "_roofRasters": roofRastersByLayer,
  "_sceneOrigin": sceneOriginByLayer,
  "_shadowMeshes": shadowMeshesByLayer,
  "_shared": sharedByLayer,
  "_size": sizeByLayer,
  "_terrain3D": terrain3DByLayer,
  "_terrainArchive": terrainArchiveByLayer,
  "_terrainBaseY": terrainBaseYByLayer,
  "_terrainBounds": terrainBoundsByLayer,
  "_terrainController": terrainControllerByLayer,
  "_terrainGrids": terrainGridsByLayer,
  "_terrainLoading": terrainLoadingByLayer,
  "_terrainOriginElevation": terrainOriginElevationByLayer,
  "_terrainPromise": terrainPromiseByLayer,
  "_terrainReady": terrainReadyByLayer,
  "_terrainRequest": terrainRequestByLayer,
  "_terrainTiles": terrainTilesByLayer,
  "_terrainZoom": terrainZoomByLayer,
  "_tileZoom": tileZoomByLayer,
  "_tooltip": tooltipByLayer,
  "_type": typeByLayer,
  "_visibleMeshes": visibleMeshesByLayer,
  "_wantedRasterTiles": wantedRasterTilesByLayer,
  "_zoomLevel": zoomLevelByLayer,
  "_zoomTransitions": zoomTransitionsByLayer,
  "_zoomView": zoomViewByLayer,
  "camera": cameraByLayer,
  "container": containerByLayer,
  "control": controlByLayer,
  "eventMap": eventMapByLayer,
  "events": eventsByLayer,
  "group": groupByLayer,
  "header": headerByLayer,
  "highlightedFeature": highlightedFeatureByLayer,
  "hoveredFeature": hoveredFeatureByLayer,
  "kind": kindByLayer,
  "location": locationByLayer,
  "model": modelByLayer,
  "modelUrl": modelUrlByLayer,
  "raycaster": raycasterByLayer,
  "ready": readyByLayer,
  "renderer": rendererByLayer,
  "root": rootByLayer,
  "scene": sceneByLayer,
  "terrainSource": terrainSourceByLayer,
  "url": urlByLayer,
  "walker": walkerByLayer,
};
