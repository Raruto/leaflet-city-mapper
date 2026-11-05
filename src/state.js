import { nativeSetLatLng } from './core/nativeSetLatLng.js';
import { nativeSetLatLngs } from './core/nativeSetLatLngs.js';
import { nativeAddLatLng } from './core/nativeAddLatLng.js';
import { nativeSetRadius } from './core/nativeSetRadius.js';
import { nativeSetStyle } from './core/nativeSetStyle.js';
import { nativeRedraw } from './core/nativeRedraw.js';
import { nativeSetIcon } from './core/nativeSetIcon.js';
import { nativeSetUrl } from './core/nativeSetUrl.js';
import { nativeSetBounds } from './core/nativeSetBounds.js';
import { nativeSetOpacity } from './core/nativeSetOpacity.js';
import { nativeSetZIndex } from './core/nativeSetZIndex.js';
import { nativeSetZIndexOffset } from './core/nativeSetZIndexOffset.js';
import { nativeBringToFront } from './core/nativeBringToFront.js';
import { nativeBringToBack } from './core/nativeBringToBack.js';
import { box } from './geometry/box.js';
import { carModel } from './vehicles/carModel.js';
import { boatModel } from './vehicles/boatModel.js';
import { busModel } from './vehicles/busModel.js';
import { tramModel } from './vehicles/tramModel.js';
import { metroModel } from './vehicles/metroModel.js';
import { bicycleModel } from './vehicles/bicycleModel.js';
import { pedestrianModel } from './vehicles/pedestrianModel.js';

export const state = {};
state.allocationTrafficEmptyOptions = Object.freeze({});
state.allocationTrafficEmptyList = Object.freeze([]);
state.allocationTrafficRouteMaterial = Object.freeze({ unlit: true });
state.allocationTrafficClocks = new Map();

state.allocationCameraEmptyOptions = Object.freeze({});
state.allocationCameraAnimatedOptions = Object.freeze({
  animate: true
});
state.allocationCameraZeroPadding = Object.freeze([0, 0]);
state.allocationCameraAngles = [1, 0, 1, 0];
state.allocationCameraListenerOptions = Object.freeze({
  capture: true,
  passive: false
});
state.allocationCameraFocusOptions = Object.freeze({
  preventScroll: true
});
state.allocationCameraDragSensitivity = Object.freeze([0.8, 0.5]);
state.allocationCameraBearingSensitivity = Object.freeze([0.8, 0]);
state.allocationSceneWalkHandlers = ['dragging', 'keyboard', 'doubleClickZoom', 'boxZoom'];
state.allocationSceneEmptyOptions = Object.freeze({});
state.allocationSceneTransferFields = ['_layers', '_sceneOrigin', '_size', '_zoomLevel', '_zoomTransitions', '_zoomView', '_cursor', '_roofRaster'];
state.allocationSceneCleanupFields = ['_layers', '_sceneOrigin', '_size', '_zoomLevel', '_cursor'];
state.allocationSceneSunlightUniforms = new Float32Array(20);
state.allocationSceneSunlightUniforms[0] = state.allocationSceneSunlightUniforms[5] =
  state.allocationSceneSunlightUniforms[10] = state.allocationSceneSunlightUniforms[15] = 1;
state.allocationCoreWhite = Object.freeze([1, 1, 1]);
state.allocationCoreQuadIndices = Object.freeze([0, 2, 1, 1, 2, 3]);
state.allocationCoreQuadUV = Object.freeze([0, 0, 1, 0, 0, 1, 1, 1]);
state.allocationCoreEventTypes = new Set([
  'click', 'preclick', 'dblclick', 'contextmenu', 'mousedown', 'mouseup', 'mousemove', 'mouseover', 'mouseout',
  'pointerdown', 'pointerup', 'pointermove', 'pointerover', 'pointerout',
]);
state.allocationCoreSampler = Object.freeze({
  minFilter: 'linear',
  magFilter: 'linear'
});
state.allocationCoreMatrixKeys = Object.freeze([
  'm11', 'm12', 'm13', 'm14', 'm21', 'm22', 'm23', 'm24',
  'm31', 'm32', 'm33', 'm34', 'm41', 'm42', 'm43', 'm44',
]);


state.headerOffsets = [
  'rootDirectoryOffset', 'rootDirectoryLength', 'jsonMetadataOffset', 'jsonMetadataLength',
  'leafDirectoryOffset', 'leafDirectoryLength', 'tileDataOffset', 'tileDataLength',
  'numAddressedTiles', 'numTileEntries', 'numTileContents',
];
state.headerFlags = ['clustered', 'internalCompression', 'tileCompression', 'tileType', 'minZoom', 'maxZoom'];
state.headerBounds = ['minLon', 'minLat', 'maxLon', 'maxLat'];
state.directoryReader = {
  bytes: null,
  cursor: 0
};
state.archiveDecoder = new TextDecoder();
state.atmosphereStops = [
  [-18, [3, 7, 20],
    [17, 28, 54],
    [0.025, 0.04, 0.09]
  ],
  [-6, [37, 53, 84],
    [182, 106, 86],
    [0.12, 0.10, 0.14]
  ],
  [0, [101, 131, 171],
    [246, 170, 115],
    [0.38, 0.24, 0.18]
  ],
  [10, [74, 147, 208],
    [197, 221, 237],
    [0.80, 0.75, 0.68]
  ],
  [25, [53, 144, 213],
    [223, 238, 250],
    [1, 1, 1]
  ],
];
state.atmosphereColor = [0, 0, 0];

state.sizes = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4
};

state.types = {
  5120: Int8Array,
  5121: Uint8Array,
  5122: Int16Array,
  5123: Uint16Array,
  5125: Uint32Array,
  5126: Float32Array,
};

// Walls (non-horizontal triangles) of a mesh in world space, bucketed by 8 m cells; `origin` is the world translation
// at build time, since layer roots only move vertically with the terrain afterwards.
state.CELL = 8;

/** Rendering owner per map; entries are removed on the last layer removal. */
state.renderers = new WeakMap();

state.nextId = 0;

state.colliders = new WeakMap();

state.dark = [0.08, 0.07, 0.06];

/**
 * WGSL twin of getElevation for the vertex shader: bilinear DEM pixels, or the first valid
 * neighbour near no-data (stored as -1e9), else `base`. Expects `dem: texture_2d<f32>`.
 */
state.elevationWGSL = /* wgsl */ `
  fn demSample(pixel: vec2<i32>) -> f32 {
    if (any(pixel < vec2<i32>(0)) || any(pixel >= vec2<i32>(textureDimensions(dem)))) { return -1e9; }
    return textureLoad(dem, pixel, 0).r;
  }
  fn elevation(pixel: vec2<f32>, base: f32) -> f32 {
    let p = pixel - vec2<f32>(0.5);
    let f = fract(p);
    let i = vec2<i32>(floor(p));
    let v00 = demSample(i);
    let v10 = demSample(i + vec2<i32>(1, 0));
    let v01 = demSample(i + vec2<i32>(0, 1));
    let v11 = demSample(i + vec2<i32>(1, 1));
    if (v00 > -1000.0 && v10 > -1000.0 && v01 > -1000.0 && v11 > -1000.0) {
      return mix(mix(v00, v10, f.x), mix(v01, v11, f.x), f.y);
    }
    if (v00 > -1000.0) { return v00; }
    if (v10 > -1000.0) { return v10; }
    if (v01 > -1000.0) { return v01; }
    if (v11 > -1000.0) { return v11; }
    return base;
  }
`;

state.glass = [0.12, 0.15, 0.18];

state.headlight = [1.9, 1.85, 1.7];

state.HEIGHT = 8;

state.hull = [
  [-5.5, 30],
  [5.5, 30],
  [5.5, -20],
  [4, -26],
  [1.5, -30],
  [-1.5, -30],
  [-4, -26],
  [-5.5, -20]
];

state.instanceStates = new WeakMap();

// [part, pivot x, pivot y, swing sign]
state.limbs = [
  ['body', 0, 0, 0],
  ['leg', -0.09, 0.9, 1],
  ['leg', 0.09, 0.9, -1],
  ['arm', -0.25, 1.42, -1],
  ['arm', 0.25, 1.42, 1]
];

// W/S (↑/↓) run forward/back along the heading, A/D (←/→) turn: [forward, turn].
state.moves = {
  KeyW: [1, 0],
  ArrowUp: [1, 0],
  KeyS: [-1, 0],
  ArrowDown: [-1, 0],
  KeyD: [0, 1],
  ArrowRight: [0, 1],
  KeyA: [0, -1],
  ArrowLeft: [0, -1]
};

state.nativeEventMaps = new WeakMap();

state.nativeMethodHandlers = {
  setLatLng: nativeSetLatLng,
  setLatLngs: nativeSetLatLngs,
  addLatLng: nativeAddLatLng,
  setRadius: nativeSetRadius,
  setStyle: nativeSetStyle,
  redraw: nativeRedraw,
  setIcon: nativeSetIcon,
  setUrl: nativeSetUrl,
  setBounds: nativeSetBounds,
  setOpacity: nativeSetOpacity,
  setZIndex: nativeSetZIndex,
  setZIndexOffset: nativeSetZIndexOffset,
  bringToFront: nativeBringToFront,
  bringToBack: nativeBringToBack,
};

// Built-in vehicles for the 'traffic' type. Models are [ring of [x, z], bottom, top, rgb, topRing?] convex prisms in metres;
// forward is -z, right is +x. `topRing` (same length as `ring`) tapers the prism; rgb components above 1 are self-lit lamps.
state.paints = [
  [0.86, 0.86, 0.88],
  [0.1, 0.1, 0.12],
  [0.5, 0.53, 0.57],
  [0.65, 0.1, 0.08],
  [0.12, 0.25, 0.55],
  [0.85, 0.7, 0.15]
];

state.trousers = [0.16, 0.2, 0.32];

state.shirt = [0.75, 0.2, 0.15];

// Pedestrian, about 1.77 m tall, prisms as in utils/vehicles.js (forward -z). Limbs hang from their pivot at y = 0.
state.skin = [0.85, 0.64, 0.5];

state.parts = {
  body: [
    [box(-0.17, 0.17, -0.1, 0.1), 0.82, 0.95, state.trousers],
    [box(-0.19, 0.19, -0.11, 0.11), 0.95, 1.44, state.shirt],
    [box(-0.05, 0.05, -0.05, 0.05), 1.44, 1.5, state.skin],
    [box(-0.1, 0.1, -0.11, 0.1), 1.5, 1.72, state.skin],
    [box(-0.105, 0.105, -0.06, 0.115), 1.58, 1.77, state.dark],
    [box(-0.105, 0.105, -0.115, -0.06), 1.7, 1.77, state.dark],
  ],
  leg: [
    [box(-0.07, 0.07, -0.07, 0.07), -0.82, 0, state.trousers],
    [box(-0.07, 0.07, -0.17, 0.07), -0.9, -0.82, state.dark]
  ],
  arm: [
    [box(-0.05, 0.05, -0.05, 0.05), -0.55, 0, state.shirt],
    [box(-0.045, 0.045, -0.045, 0.045), -0.66, -0.55, state.skin]
  ],
};

state.pendingUpdates = new Set();

state.ringDirections = [{
    x: Math.cos(0 * Math.PI / 4),
    y: Math.sin(0 * Math.PI / 4),
    nx: Math.cos((0 + 0.5) * Math.PI / 4),
    nz: -Math.sin((0 + 0.5) * Math.PI / 4)
  },
  {
    x: Math.cos(1 * Math.PI / 4),
    y: Math.sin(1 * Math.PI / 4),
    nx: Math.cos((1 + 0.5) * Math.PI / 4),
    nz: -Math.sin((1 + 0.5) * Math.PI / 4)
  },
  {
    x: Math.cos(2 * Math.PI / 4),
    y: Math.sin(2 * Math.PI / 4),
    nx: Math.cos((2 + 0.5) * Math.PI / 4),
    nz: -Math.sin((2 + 0.5) * Math.PI / 4)
  },
  {
    x: Math.cos(3 * Math.PI / 4),
    y: Math.sin(3 * Math.PI / 4),
    nx: Math.cos((3 + 0.5) * Math.PI / 4),
    nz: -Math.sin((3 + 0.5) * Math.PI / 4)
  },
  {
    x: Math.cos(4 * Math.PI / 4),
    y: Math.sin(4 * Math.PI / 4),
    nx: Math.cos((4 + 0.5) * Math.PI / 4),
    nz: -Math.sin((4 + 0.5) * Math.PI / 4)
  },
  {
    x: Math.cos(5 * Math.PI / 4),
    y: Math.sin(5 * Math.PI / 4),
    nx: Math.cos((5 + 0.5) * Math.PI / 4),
    nz: -Math.sin((5 + 0.5) * Math.PI / 4)
  },
  {
    x: Math.cos(6 * Math.PI / 4),
    y: Math.sin(6 * Math.PI / 4),
    nx: Math.cos((6 + 0.5) * Math.PI / 4),
    nz: -Math.sin((6 + 0.5) * Math.PI / 4)
  },
  {
    x: Math.cos(7 * Math.PI / 4),
    y: Math.sin(7 * Math.PI / 4),
    nx: Math.cos((7 + 0.5) * Math.PI / 4),
    nz: -Math.sin((7 + 0.5) * Math.PI / 4)
  },
];

state.roundProfile = [
  [0, 0],
  [0.35, 0.8],
  [0.6, 1],
  [0.85, 0.7],
  [1, 0]
];

// Pure helpers of the 'traffic' type: lane interpolation and vehicle scheduling.
/** Default urban speed (m/s) used to turn a lane's hourly `flow` into vehicles on the road. */
state.speed = 8;

state.taillight = [1.7, 0.06, 0.05];

state.TILE_RADIUS = 6;

state.TILE_SIZE = 256;

// One workgroup per vehicle shares its lane lookup and pose across all model vertices.
state.trafficShader = /* wgsl */ `
  struct Params { seconds: f32, side: f32, vertices: u32, total: u32 }
  struct Vehicle { start: u32, count: u32, base: f32, speed: f32 }
  @group(0) @binding(0) var<uniform> params: Params;
  @group(0) @binding(1) var<storage, read> model: array<f32>;
  @group(0) @binding(2) var<storage, read> points: array<vec4f>;
  @group(0) @binding(3) var<storage, read> vehicles: array<Vehicle>;
  @group(0) @binding(4) var<storage, read_write> position: array<f32>;
  @group(0) @binding(5) var<storage, read_write> normal: array<f32>;
  var<workgroup> center: vec3f;
  var<workgroup> heading: vec2f;
  @compute @workgroup_size(64)
  fn main(@builtin(workgroup_id) group: vec3u, @builtin(local_invocation_index) thread: u32) {
    let vehicleIndex = group.x;
    if (thread == 0u) {
      let vehicle = vehicles[vehicleIndex];
      let last = vehicle.start + vehicle.count - 1u;
      let length = points[last].w;
      var s = vehicle.base + params.seconds * vehicle.speed;
      s -= length * floor(s / length);
      var i = vehicle.start + 1u;
      var end = last;
      while (i < end) {
        let middle = i + (end - i) / 2u;
        if (points[middle].w < s) { i = middle + 1u; }
        else { end = middle; }
      }
      let a = points[i - 1u];
      let b = points[i];
      let d = select(b.w - a.w, 1.0, b.w == a.w);
      let t = (s - a.w) / d;
      heading = (b.xy - a.xy) / d;
      center = vec3f(a.x + (b.x - a.x) * t - heading.y * params.side,
        a.z + (b.z - a.z) * t, a.y + (b.y - a.y) * t + heading.x * params.side);
    }
    workgroupBarrier();
    for (var vertex = thread; vertex < params.vertices; vertex += 64u) {
      let k = vertex * 3u;
      let n = params.vertices * 3u + k;
      let o = (vehicleIndex * params.vertices + vertex) * 3u;
      position[o] = center.x - model[k] * heading.y - model[k + 2u] * heading.x;
      position[o + 1u] = center.y + model[k + 1u];
      position[o + 2u] = center.z + model[k] * heading.x - model[k + 2u] * heading.y;
      normal[o] = -model[n] * heading.y - model[n + 2u] * heading.x;
      normal[o + 1u] = model[n + 1u];
      normal[o + 2u] = model[n] * heading.x - model[n + 2u] * heading.y;
    }
  }`;

state.tyre = [0.05, 0.05, 0.05];

/**
 * `side`: default offset (metres) to the right of the lane centreline. `model(i)` gives the prisms of the i-th vehicle.
 * `lights`: night point lights in model space (see the night lighting grid), e.g. the pool cast by the headlights.
 */
state.vehicles = {
  bicycle: {
    side: 0.4,
    model: bicycleModel
  },
  pedestrian: {
    side: 0.3,
    model: pedestrianModel
  },
  bus: {
    side: 1.5,
    model: busModel
  },
  tram: {
    side: 0,
    model: tramModel
  },
  metro: {
    side: 0,
    model: metroModel
  },
  car: {
    side: 1.8,
    model: carModel,
    lights: [{
      position: [0, 1.2, -6],
      radius: 10,
      color: [1, 0.94, 0.82],
      flux: 800
    }]
  },
  // Panoramic river cruiser, about 60 × 11 m: glass saloon, open upper deck with benches, wheelhouse forward.
  boat: {
    side: 0,
    model: boatModel,
    lights: [{
      position: [0, 8, 4],
      radius: 30,
      color: [1, 0.8, 0.55],
      flux: 20000
    }]
  },
};

state.white = [0.92, 0.93, 0.92];

state.loading = Promise.resolve();
state.pendingInitializations = [];
state.closestMethods = new WeakMap();
state.boundsMethods = new WeakMap();
state.gridInitializers = new WeakMap();
state.pendingGridFades = new Map();
state.gridFadeFrame = null;
state.pendingRasterLoads = [];
state.triangleContexts = [];
state.rendererDevices = new WeakMap();
state.pendingMapChanges = [];
state.pendingZoomAnimations = [];
state.pendingPlacements = [];
state.imageStates = new WeakMap();
state.geometryPixelStates = [];
state.cameraDrags = new Set();
state.dragStates = new WeakMap();
state.cameraTouchStates = new Set();
state.radians = Math.PI / 180;
state.cameraAnimations = new Map();
state.cameraAnimationFrame = null;
state.pendingMarkerPan = new Map();
state.markerPanFrame = null;
state.allocationGeometryEmpty = [];
state.allocationGeometryQuaternion = [0, 0, 0, 1];
state.allocationGeometryScale = [1, 1, 1];
state.allocationGeometryTranslation = [0, 0, 0];
state.allocationGeometrySemantics = [
  ['POSITION', 'position'],
  ['NORMAL', 'normal'],
  ['TEXCOORD_0', 'uv']
];
state.allocationGeometryImageOptions = {
  premultiplyAlpha: 'none',
  colorSpaceConversion: 'none'
};
state.allocationGeometryDecoder = new TextDecoder();

state.allocationRenderComposeRoofAtlasCreateBuffer1 = {
  size: null,
  usage: null
};
state.allocationRenderComposeRoofAtlasBeginRenderPass2 = {
  colorAttachments: [{
    view: null,
    clearValue: {
      r: 0,
      g: 0,
      b: 0,
      a: 0
    },
    loadOp: 'clear',
    storeOp: 'store'
  }]
};
state.allocationRenderComposeRoofAtlasCopyExternalImageToTexture3 = {
  source: null
};
state.allocationRenderComposeRoofAtlasCopyExternalImageToTexture4 = {
  texture: null
};
state.allocationRenderComposeRoofAtlasCopyExternalImageToTexture5 = [null, null];
state.allocationRenderComposeRoofAtlasCreateBindGroup6 = {
  layout: null,
  entries: [{
    binding: 0,
    resource: null
  }, {
    binding: 1,
    resource: null
  }, {
    binding: 2,
    resource: {
      buffer: null,
      offset: null,
      size: 4
    }
  }]
};
state.allocationRenderComposeRoofAtlasSubmit7 = [null];
state.allocationRenderCreateMeshCreateBuffer1 = {
  size: null,
  usage: null
};
state.allocationRenderCreateProgramCreateShaderModule1 = {
  code: null
};
state.allocationRenderCreateProgramCreateShaderModule2 = {
  code: null
};
state.allocationRenderCreateProgramCreateBindGroupLayout3 = {
  entries: null
};
state.allocationRenderCreateProgramCreatePipelineLayout4 = {
  bindGroupLayouts: [null, null]
};
state.allocationRenderDrawGeometryCreateRenderPipeline1 = {
  layout: null,
  vertex: {
    module: null,
    entryPoint: 'vertexMain',
    buffers: null
  },
  fragment: {
    module: null,
    entryPoint: 'fragmentMain',
    targets: [{
      format: null,
      blend: null,
      writeMask: null
    }]
  },
  primitive: {
    topology: 'triangle-list',
    cullMode: null,
    frontFace: null
  },
  depthStencil: {
    format: 'depth24plus',
    depthWriteEnabled: null,
    depthCompare: null
  }
};
state.allocationRenderDrawGeometryCopyExternalImageToTexture2 = {
  source: null,
  flipY: null
};
state.allocationRenderDrawGeometryCopyExternalImageToTexture3 = {
  texture: null
};
state.allocationRenderDrawGeometryCopyExternalImageToTexture4 = [null, null];
state.allocationRenderDrawGeometryCreateBindGroup5 = {
  layout: null,
  entries: null
};
state.allocationRenderDrawGeometrySetBindGroup6 = [null];
state.allocationRenderDrawSceneMeshesBeginRenderPass1 = {
  colorAttachments: [{
    view: null,
    clearValue: {
      r: 0,
      g: 0,
      b: 0,
      a: 0
    },
    loadOp: 'clear',
    storeOp: 'store'
  }],
  depthStencilAttachment: {
    view: null,
    depthClearValue: 1,
    depthLoadOp: 'clear',
    depthStoreOp: 'store'
  }
};
state.allocationRenderEnsureRoofBlitCreateShaderModule1 = {
  code: `
      @group(0) @binding(0) var source: texture_2d<f32>;
      @group(0) @binding(1) var sourceSampler: sampler;
      @group(0) @binding(2) var<uniform> opacity: f32;
      struct Varyings { @builtin(position) position: vec4f, @location(0) uv: vec2f };
      @vertex fn vertexMain(@builtin(vertex_index) index: u32) -> Varyings {
        let uv = vec2f(f32(index & 1u), f32(index >> 1u));
        return Varyings(vec4f(uv.x * 2.0 - 1.0, 1.0 - uv.y * 2.0, 0.0, 1.0), uv);
      }
      @fragment fn fragmentMain(input: Varyings) -> @location(0) vec4f {
        let color = textureSample(source, sourceSampler, input.uv);
        return vec4f(color.rgb, color.a * opacity);
      }
    `
};
state.allocationRenderEnsureRoofBlitCreateRenderPipeline2 = {
  layout: 'auto',
  vertex: {
    module: null,
    entryPoint: 'vertexMain'
  },
  fragment: {
    module: null,
    entryPoint: 'fragmentMain',
    targets: [{
      format: 'rgba8unorm',
      blend: {
        color: {
          srcFactor: 'src-alpha',
          dstFactor: 'one-minus-src-alpha',
          operation: 'add'
        },
        alpha: {
          srcFactor: 'one',
          dstFactor: 'one-minus-src-alpha',
          operation: 'add'
        }
      }
    }]
  },
  primitive: {
    topology: 'triangle-strip'
  }
};
state.allocationRenderEnsureRoofBlitCreateSampler3 = {
  magFilter: 'linear',
  minFilter: 'linear'
};
state.allocationRenderPrepareFrameUniformsCreateBuffer1 = {
  size: null,
  usage: null
};
state.allocationRenderRebuildRoofAtlasCreateTexture1 = {
  size: [null, null],
  format: 'rgba8unorm',
  usage: null
};
state.allocationRenderRebuildRoofAtlasCreateSampler3 = {
  addressModeU: 'clamp-to-edge',
  addressModeV: 'clamp-to-edge'
};
state.allocationRenderRenderSubmit1 = [null];
state.allocationRenderResizeRendererCreateTexture1 = {
  size: [null, null],
  format: 'depth24plus',
  usage: null
};
state.allocationRenderBindSunlightCreateBindGroup1 = {
  layout: null,
  entries: [{
    binding: 0,
    resource: {
      buffer: null
    }
  }, {
    binding: 1,
    resource: null
  }, {
    binding: 2,
    resource: null
  }, {
    binding: 3,
    resource: {
      buffer: null
    }
  }]
};
state.allocationRenderDrawShadowMeshesBeginRenderPass1 = {
  colorAttachments: [],
  depthStencilAttachment: {
    view: null,
    depthClearValue: 1,
    depthLoadOp: 'clear',
    depthStoreOp: 'store'
  }
};
state.allocationRenderDrawShadowMeshesCreateBindGroup2 = {
  layout: null,
  entries: [{
    binding: 0,
    resource: {
      buffer: null,
      size: 144
    }
  }]
};
state.allocationRenderDrawShadowMeshesSetBindGroup3 = [null];
state.allocationRenderEnsureShadowPipelineCreateBindGroupLayout1 = {
  entries: [{
    binding: 0,
    visibility: null,
    buffer: {
      type: 'uniform',
      hasDynamicOffset: true
    }
  }]
};
state.allocationRenderEnsureShadowPipelineCreateBindGroupLayout2 = {
  entries: [{
    binding: 0,
    visibility: null,
    buffer: {
      type: 'uniform'
    }
  }]
};
state.allocationRenderEnsureShadowPipelineCreateBindGroup3 = {
  layout: null,
  entries: [{
    binding: 0,
    resource: {
      buffer: null
    }
  }]
};
state.allocationRenderEnsureShadowPipelineCreateShaderModule4 = {
  code: null
};
state.allocationRenderEnsureShadowPipelineCreateRenderPipeline5 = {
  layout: null,
  vertex: {
    module: null,
    entryPoint: 'main',
    buffers: null
  },
  fragment: {
    module: null,
    entryPoint: 'fragmentMain',
    targets: []
  },
  primitive: {
    topology: 'triangle-list',
    cullMode: 'none'
  },
  depthStencil: {
    format: 'depth32float',
    depthWriteEnabled: true,
    depthCompare: 'less',
    depthBias: 2,
    depthBiasSlopeScale: 2
  }
};
state.allocationRenderResizeSunlightCreateTexture1 = {
  size: [null, null],
  format: 'depth32float',
  usage: null
};
state.allocationRenderDefaultMaterial = Object.freeze({});
state.allocationRenderEmpty = Object.freeze([]);
state.allocationRenderBlobParts = [null];
state.allocationRenderWantedTiles = new Map();
state.allocationRenderCoverageTiles = new Map();
state.allocationRenderRasterPoint = {
  x: 0,
  y: 0
};
state.allocationRenderArchiveNorthWest = [0, 0];
state.allocationRenderArchiveSouthEast = [0, 0];
state.allocationRenderSubtree = {
  subtree: true
};
state.allocationRenderOpacities = new Float32Array(64);
state.allocationRenderRoofSignatures = [];
state.allocationRenderRoofTiles = [];
state.allocationRenderRoofMin = {
  x: 0,
  y: 0
};
state.allocationRenderRoofSize = {
  x: 1,
  y: 1
};
state.allocationRenderShadowValues = new Float32Array(20);
state.allocationRenderDisabledShadow = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0]);
state.allocationRenderAlphaBlend = {
  color: {
    srcFactor: 'src-alpha',
    dstFactor: 'one-minus-src-alpha',
    operation: 'add'
  },
  alpha: {
    srcFactor: 'one',
    dstFactor: 'one-minus-src-alpha',
    operation: 'add'
  },
};
state.allocationRenderDrawEntries = [];
state.allocationRenderDrawMeshEntry = {
  binding: 0,
  resource: {
    buffer: null,
    size: 144
  }
};
state.allocationRenderDrawFrameEntry = {
  binding: 1,
  resource: {
    buffer: null,
    size: 240
  }
};
state.allocationRenderDrawTerrainEntry = {
  binding: 2,
  resource: null
};
state.allocationRenderDrawTextureEntries = [{
    binding: null,
    resource: null
  }, {
    binding: null,
    resource: null
  }, {
    binding: null,
    resource: null
  },
  {
    binding: null,
    resource: null
  }, {
    binding: null,
    resource: null
  },
];
state.allocationRenderDrawSamplerEntries = [{
    binding: null,
    resource: null
  }, {
    binding: null,
    resource: null
  }, {
    binding: null,
    resource: null
  },
  {
    binding: null,
    resource: null
  }, {
    binding: null,
    resource: null
  },
];
state.allocationRenderPositionLayout = Object.freeze({
  arrayStride: 12,
  attributes: Object.freeze([Object.freeze({
    shaderLocation: 0,
    offset: 0,
    format: 'float32x3'
  })])
});
state.allocationRenderNormalLayout = Object.freeze({
  arrayStride: 12,
  attributes: Object.freeze([Object.freeze({
    shaderLocation: 1,
    offset: 0,
    format: 'float32x3'
  })])
});
state.allocationRenderColorLayout = Object.freeze({
  arrayStride: 12,
  attributes: Object.freeze([Object.freeze({
    shaderLocation: 2,
    offset: 0,
    format: 'float32x3'
  })])
});
state.allocationRenderUVLayout = Object.freeze({
  arrayStride: 8,
  attributes: Object.freeze([Object.freeze({
    shaderLocation: 3,
    offset: 0,
    format: 'float32x2'
  })])
});
state.allocationRenderInstanceLayout = Object.freeze({
  arrayStride: 16,
  stepMode: 'instance',
  attributes: Object.freeze([Object.freeze({
    shaderLocation: 4,
    offset: 0,
    format: 'float32x4'
  })])
});
state.allocationRenderShadowLayouts = [state.allocationRenderPositionLayout];
state.allocationRenderShadowInstanceLayouts = [state.allocationRenderPositionLayout, state.allocationRenderInstanceLayout];
state.allocationRenderProgramEntries = [];
state.allocationRenderMeshLayoutEntry = {
  binding: 0,
  visibility: null,
  buffer: {
    type: 'uniform',
    hasDynamicOffset: true
  }
};
state.allocationRenderFrameLayoutEntry = {
  binding: 1,
  visibility: null,
  buffer: {
    type: 'uniform'
  }
};
state.allocationRenderTerrainLayoutEntry = {
  binding: 2,
  visibility: null,
  texture: {
    sampleType: 'unfilterable-float',
    viewDimension: '2d'
  }
};
state.allocationRenderTextureLayoutEntries = [{
    binding: null,
    visibility: null,
    texture: {
      sampleType: 'float',
      viewDimension: '2d'
    }
  },
  {
    binding: null,
    visibility: null,
    texture: {
      sampleType: 'float',
      viewDimension: '2d'
    }
  },
  {
    binding: null,
    visibility: null,
    texture: {
      sampleType: 'float',
      viewDimension: '2d'
    }
  },
  {
    binding: null,
    visibility: null,
    texture: {
      sampleType: 'float',
      viewDimension: '2d'
    }
  },
  {
    binding: null,
    visibility: null,
    texture: {
      sampleType: 'float',
      viewDimension: '2d'
    }
  },
];
state.allocationRenderSamplerLayoutEntries = [{
    binding: null,
    visibility: null,
    sampler: {
      type: 'filtering'
    }
  },
  {
    binding: null,
    visibility: null,
    sampler: {
      type: 'filtering'
    }
  },
  {
    binding: null,
    visibility: null,
    sampler: {
      type: 'filtering'
    }
  },
  {
    binding: null,
    visibility: null,
    sampler: {
      type: 'filtering'
    }
  },
  {
    binding: null,
    visibility: null,
    sampler: {
      type: 'filtering'
    }
  },
];
state.allocationRenderShadowBounds = {
  min: [0, 0, 0],
  max: [0, 0, 0]
};
state.allocationRenderShadowCamera = {
  position: [0, 0, 0],
  target: [0, 0, 0],
  up: [0, 0, -1],
  x: [0, 0, 0],
  y: [0, 0, 0],
  z: [0, 0, 0],
  fov: 45,
  aspect: 1,
  near: 1,
  far: 500,
  viewMatrix: [],
  projectionMatrix: [],
  projectionViewMatrix: [],
};
state.allocationRenderShadowLow = [0, 0, 0];
state.allocationRenderShadowHigh = [0, 0, 0];
state.allocationRenderAddRasterTileCreateTexture1 = {
  size: [null, null],
  format: 'r32float',
  usage: null
};
state.allocationRenderAddRasterTileWriteTexture2 = {
  texture: null
};
state.allocationRenderAddRasterTileWriteTexture3 = {
  bytesPerRow: null
};
state.allocationRenderAddRasterTileWriteTexture4 = [null, null];
state.allocationRenderAddRasterTileCreateBuffer5 = {
  size: null,
  usage: null
};
state.allocationRenderCreateGeometryCreateBuffer1 = {
  size: null,
  usage: null
};
state.allocationRenderCreateRasterMeshCreateTexture1 = {
  size: [null, null],
  format: 'rgba8unorm',
  usage: null
};
state.allocationRenderCreateRasterMeshCreateSampler2 = {
  addressModeU: 'clamp-to-edge',
  addressModeV: 'clamp-to-edge',
  magFilter: 'linear',
  minFilter: 'linear'
};

state.allocationRenderRasterPositions = [0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 1];
state.allocationRenderRasterNormals = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];
state.allocationRenderRasterUVs = [0, 0, 1, 0, 0, 1, 1, 1];
state.allocationRenderRasterIndices = [0, 2, 1, 1, 2, 3];

state.allocationRenderEnsureShadowPipelineCreatePipelineLayout1 = {
  bindGroupLayouts: [null, null]
};