import * as globals from './globals.js';

import '../../src/index.js';



import { mapSetPitchAndBearing } from '../../src/camera/mapSetPitchAndBearing.js';
import { mapStopPitchBearingAnimation } from '../../src/animations/mapStopPitchBearingAnimation.js';
import { mapAnimateCamera } from '../../src/animations/mapAnimateCamera.js';
import { mapUpdateCameraOverlays } from '../../src/camera/mapUpdateCameraOverlays.js';
import { markerCameraIconPoint } from '../../src/projections/markerCameraIconPoint.js';
import { ready } from '../../src/core/whenReady.js';
import { callLayer } from '../../src/scene/callLayer.js';
import { getLocation } from '../../src/scene/getLocation.js';
import { mapGetPitch } from '../../src/camera/mapGetPitch.js';
import { mapGetBearing } from '../../src/camera/mapGetBearing.js';
import { mapSetPitch } from '../../src/camera/mapSetPitch.js';
import { mapSetBearing } from '../../src/camera/mapSetBearing.js';
import { mapResetNorth } from '../../src/camera/mapResetNorth.js';
import { mapResetNorthPitch } from '../../src/camera/mapResetNorthPitch.js';
import { markerSetRotation } from '../../src/core/markerSetRotation.js';
import { createMesh } from '../../src/rendering/createMesh.js';
import { createProgram } from '../../src/materials/createProgram.js';
import { destroyTexture } from '../../src/textures/destroyTexture.js';
import { disposeMesh } from '../../src/rendering/disposeMesh.js';
import { findFeature } from '../../src/picking/findFeature.js';
import { raycast } from '../../src/picking/raycast.js';
import { onClick } from '../../src/picking/onClick.js';
import { onPointerLeave } from '../../src/picking/onPointerLeave.js';
import { setHighlight } from '../../src/picking/setHighlight.js';
import { showFeature } from '../../src/picking/showFeature.js';
import { render } from '../../src/rendering/render.js';
import { update } from '../../src/scene/scheduleSceneUpdate.js';
import { compareMeshes } from '../../src/rendering/compareMeshes.js';
import { pump } from '../../src/sources/pumpSourceAreas.js';
import { releaseArea } from '../../src/sources/releaseArea.js';
import { emptyNode } from '../../src/scene/createSceneNode.js';
import { setParent } from '../../src/scene/setParent.js';
import { traverse } from '../../src/scene/traverse.js';
import { updateWorldMatrix } from '../../src/transforms/updateWorldMatrix.js';
import { updateCamera } from '../../src/camera/updateSceneCamera.js';
import { parseColor } from '../../src/colors/parseColor.js';
import { triangulate } from '../../src/triangulation/triangulate.js';
import { lampPostGeometry } from '../../src/geometry/lampPostGeometry.js';
import { lightGeometry } from '../../src/geometry/lightGeometry.js';
import { getElevation } from '../../src/terrain/getElevation.js';
import { local } from '../../src/projections/walkerLocalPosition.js';
import { hit } from '../../src/picking/hit.js';
import { attachAreaMesh } from '../../src/sources/attachAreaMesh.js';
import { instanceAreaGeometry } from '../../src/geometry/instanceAreaGeometry.js';
import { prepareFrameUniforms } from '../../src/rendering/prepareFrameUniforms.js';
import { drawSceneMeshes } from '../../src/rendering/drawSceneMeshes.js';
import { ensureShadowPipeline } from '../../src/shadows/ensureShadowPipeline.js';
import { drawShadowMeshes } from '../../src/shadows/drawShadowMeshes.js';
import { bindSunlight } from '../../src/shadows/bindSunlight.js';
import { intersectMeshes } from '../../src/collision/intersectMeshes.js';
import { restoreObject } from '../../src/scene/restoreObject.js';
import { computeBounds } from '../../src/geometry/computeBounds.js';

globalThis.globals = globals;

globalThis.nativeCheckModules = {
  graph: { emptyNode, setParent, traverse, updateWorldMatrix, updateCamera },
  gpu: { createMesh, createProgram, destroyTexture, disposeMesh },
  picking: { findFeature, raycast, onClick, onPointerLeave, setHighlight, showFeature },
  render: { render, update, compareMeshes },
  sources: { pump, releaseArea },
  geometry: { parseColor, triangulate, lampPostGeometry, lightGeometry },
  walk: { local, hit },
  instancing: {
    attachAreaMesh, instanceAreaGeometry, emptyNode, updateWorldMatrix,
    prepareFrameUniforms, drawSceneMeshes, ensureShadowPipeline, drawShadowMeshes,
    bindSunlight, intersectMeshes, setHighlight, releaseArea, restoreObject, computeBounds,
  },
  getElevation,
};

globalThis.testOperations = {
  ready, getLocation,
  getPitch: mapGetPitch, getBearing: mapGetBearing,
  setPitch: mapSetPitch, setBearing: mapSetBearing,
  resetNorth: mapResetNorth, resetNorthPitch: mapResetNorthPitch,
  setRotation: markerSetRotation,
  setData: callLayer.bind(null, 'setData'),
  getHeader: callLayer.bind(null, 'getHeader'),
  getZxy: callLayer.bind(null, 'getZxy'),
  getTileSize: callLayer.bind(null, 'getTileSize'),
  isLoading: callLayer.bind(null, 'isLoading'),
  setOpacity: callLayer.bind(null, 'setOpacity'),
  setZIndex: callLayer.bind(null, 'setZIndex'),
};

globalThis.cityMapperTestOperations = {
  mapSetPitchAndBearing, mapStopPitchBearingAnimation, mapAnimateCamera,
  mapUpdateCameraOverlays, markerCameraIconPoint,
};
