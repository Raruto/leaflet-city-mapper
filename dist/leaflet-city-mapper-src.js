(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __glob = (map) => (path) => {
    var fn = map[path];
    if (fn) return fn();
    throw new Error("Module not found in bundle: " + path);
  };
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };

  // src/utils/geometry.js
  function parseColor(value) {
    if (value && typeof value === "object" && "h" in value) {
      const { h, s, l } = value;
      const a = s * Math.min(l, 1 - l);
      const channel = (n) => {
        const k = (n + h * 12) % 12;
        return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
      };
      const toSRGB = (value2) => value2 <= 31308e-7 ? value2 * 12.92 : 1.055 * value2 ** (1 / 2.4) - 0.055;
      return { r: toSRGB(channel(0)), g: toSRGB(channel(8)), b: toSRGB(channel(4)) };
    }
    if (value && typeof value === "object" && "r" in value) return value;
    if (typeof value === "number") return {
      r: (value >> 16 & 255) / 255,
      g: (value >> 8 & 255) / 255,
      b: (value & 255) / 255
    };
    if (typeof value !== "string" || !CSS.supports("color", value)) throw new Error("Invalid 3D color");
    const context = document.createElement("canvas").getContext("2d");
    context.fillStyle = value;
    context.fillRect(0, 0, 1, 1);
    const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
    return { r: r / 255, g: g / 255, b: b / 255 };
  }
  function setVertexColor(mesh, start, end, color) {
    for (let i = start; i < end; i++) {
      mesh.geometry.attributes.color.data.set([color.r, color.g, color.b], i * 3);
    }
    mesh.geometry.attributes.color.needsUpdate = true;
  }
  function triangulate(contour, holes = []) {
    const points = [contour, ...holes].flat();
    if (points.some((p) => !Number.isFinite(p.x) || !Number.isFinite(p.y))) throw new Error("Invalid polygon coordinates");
    const vertices = points.map((p, index) => ({ x: p.x - contour[0].x, y: p.y - contour[0].y, index }));
    const cross = (a, b, c) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    const equal = (a, b) => a.x === b.x && a.y === b.y;
    const clean = (ring) => {
      let changed = true;
      while (changed && ring.length > 3) {
        changed = false;
        for (let i = 0; i < ring.length; i++) {
          const a = ring[(i + ring.length - 1) % ring.length], b = ring[i], c = ring[(i + 1) % ring.length];
          if (equal(a, b) || Math.abs(cross(a, b, c)) < 1e-10) {
            ring.splice(i, 1);
            changed = true;
            break;
          }
        }
      }
      if (ring.length < 3) throw new Error("Degenerate polygon ring");
      return ring;
    };
    let offset = 0;
    const rings = [contour, ...holes].map((path, index) => {
      const ring = clean(vertices.slice(offset, offset += path.length));
      if (isClockWise(ring) !== Boolean(index)) ring.reverse();
      return ring;
    });
    const inside = (point, ring) => {
      let result2 = false;
      for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const a = ring[i], b = ring[j];
        if (a.y > point.y !== b.y > point.y && point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x) result2 = !result2;
      }
      return result2;
    };
    const intersects = (a, b, c, d) => {
      if (equal(a, c) || equal(a, d) || equal(b, c) || equal(b, d)) return false;
      const abC = cross(a, b, c), abD = cross(a, b, d), cdA = cross(c, d, a), cdB = cross(c, d, b);
      const on = (p, q, r) => Math.min(p.x, q.x) <= r.x && r.x <= Math.max(p.x, q.x) && Math.min(p.y, q.y) <= r.y && r.y <= Math.max(p.y, q.y);
      return abC * abD < 0 && cdA * cdB < 0 || abC === 0 && on(a, b, c) || abD === 0 && on(a, b, d) || cdA === 0 && on(c, d, a) || cdB === 0 && on(c, d, b);
    };
    let polygon = rings[0].slice();
    for (const hole of rings.slice(1).sort((a, b) => Math.min(...a.map((p) => p.x)) - Math.min(...b.map((p) => p.x)))) {
      let bridge, distance = Infinity;
      for (let h2 = 0; h2 < hole.length; h2++) for (let p2 = 0; p2 < polygon.length; p2++) {
        const a = hole[h2], b = polygon[p2], d = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
        if (d >= distance) continue;
        const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        if (!inside(mid, rings[0]) || rings.slice(1).some((r) => inside(mid, r))) continue;
        if ([polygon, ...rings.slice(1)].some((r) => r.some((c, i) => intersects(a, b, c, r[(i + 1) % r.length])))) continue;
        bridge = [h2, p2];
        distance = d;
      }
      if (!bridge) throw new Error("Unable to connect polygon hole");
      const [h, p] = bridge;
      polygon = [
        ...polygon.slice(0, p + 1),
        ...hole.slice(h),
        ...hole.slice(0, h + 1),
        polygon[p],
        ...polygon.slice(p + 1)
      ];
    }
    const result = [];
    while (polygon.length > 3) {
      let clipped = false;
      for (let i = 0; i < polygon.length; i++) {
        const a = polygon[(i + polygon.length - 1) % polygon.length], b = polygon[i], c = polygon[(i + 1) % polygon.length];
        if (cross(a, b, c) <= 1e-10) continue;
        if (polygon.some((p) => !equal(p, a) && !equal(p, b) && !equal(p, c) && cross(a, b, p) >= 0 && cross(b, c, p) >= 0 && cross(c, a, p) >= 0)) continue;
        result.push([a.index, b.index, c.index]);
        polygon.splice(i, 1);
        clipped = true;
        break;
      }
      if (!clipped) throw new Error("Unable to triangulate polygon: invalid or self-intersecting rings");
    }
    if (cross(...polygon) > 1e-10) result.push(polygon.map((p) => p.index));
    const area = (ring) => Math.abs(ring.reduce((sum, p, i) => {
      const q = ring[(i + 1) % ring.length];
      return sum + p.x * q.y - q.x * p.y;
    }, 0)) / 2;
    const expected = area(rings[0]) - rings.slice(1).reduce((sum, ring) => sum + area(ring), 0);
    const actual = result.reduce((sum, triangle) => sum + cross(...triangle.map((i) => vertices[i])) / 2, 0);
    if (expected <= 0 || Math.abs(actual - expected) > Math.max(1e-7, expected * 1e-8)) throw new Error("Polygon triangulation area mismatch");
    return result;
  }
  function isClockWise(points) {
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const a = points[i], b = points[(i + 1) % points.length];
      area += a.x * b.y - b.x * a.y;
    }
    return area < 0;
  }
  function treeGeometry(point, style, addTriangle) {
    const { top, bottom = 0, trunkRadius, crownRadius, crownBottom, crownShape = "round" } = style;
    if (![trunkRadius, crownRadius, crownBottom].every(Number.isFinite) || trunkRadius <= 0 || crownRadius < trunkRadius || crownBottom <= bottom || crownBottom >= top || !["round", "cone"].includes(crownShape)) {
      throw new Error("Invalid tree dimensions or crown shape");
    }
    const trunk = parseColor(style.trunkColor ?? 7491898);
    const crown = parseColor(style.color ?? 5210683);
    const ring = (radius) => Array.from({ length: 8 }, (_, i) => ({
      x: point.x + Math.cos(i * Math.PI / 4) * radius,
      y: point.y + Math.sin(i * Math.PI / 4) * radius,
      ground: point.ground
    }));
    const surface = (lowRadius, low, highRadius, high, color) => {
      const lower = ring(lowRadius), upper = ring(highRadius);
      for (let i = 0; i < 8; i++) {
        const next = (i + 1) % 8;
        const angle = (i + 0.5) * Math.PI / 4;
        const slope = (lowRadius - highRadius) / (high - low);
        const length = Math.hypot(1, slope);
        const nx = Math.cos(angle) / length, ny = slope / length, nz = -Math.sin(angle) / length;
        if (lowRadius) addTriangle(lower[i], low, lower[next], low, upper[next], high, nx, ny, nz, color);
        if (highRadius) addTriangle(lower[i], low, upper[next], high, upper[i], high, nx, ny, nz, color);
      }
    };
    surface(trunkRadius, bottom, trunkRadius, crownBottom + (top - crownBottom) * 0.25, trunk);
    if (crownShape === "cone") {
      const base = ring(crownRadius);
      for (let i = 0; i < 8; i++) addTriangle(
        point,
        crownBottom,
        base[i],
        crownBottom,
        base[(i + 1) % 8],
        crownBottom,
        0,
        -1,
        0,
        crown
      );
      surface(crownRadius, crownBottom, 0, top, crown);
    } else {
      const profile = [[0, 0], [0.35, 0.8], [0.6, 1], [0.85, 0.7], [1, 0]];
      for (let i = 1; i < profile.length; i++) {
        const [low, lr] = profile[i - 1], [high, hr] = profile[i];
        surface(
          lr * crownRadius,
          crownBottom + low * (top - crownBottom),
          hr * crownRadius,
          crownBottom + high * (top - crownBottom),
          crown
        );
      }
    }
  }
  function lightGeometry(point, style, addTriangle) {
    if (!Number.isFinite(style.lightRadius) || style.lightRadius <= 0) throw new Error("Invalid light radius");
    const color = parseColor(style.color);
    const quad = (a, b, c, d, height, normal) => {
      addTriangle(a, height, b, height, c, height, ...normal, color);
      addTriangle(a, height, c, height, d, height, ...normal, color);
    };
    const r = 0.65;
    const emitter = (u, v, axis) => ({
      x: point.x + (axis === 2 ? 0 : u * r),
      y: point.y + (axis === 1 ? 0 : axis === 2 ? u * r : v * r),
      ground: point.ground + (axis === 0 ? 0 : v * r),
      uv: [u, v]
    });
    for (let axis = 0; axis < 3; axis++) {
      quad(
        emitter(-1, -1, axis),
        emitter(1, -1, axis),
        emitter(1, 1, axis),
        emitter(-1, 1, axis),
        style.top,
        axis === 0 ? [0, 1, 0] : axis === 1 ? [0, 0, 1] : [1, 0, 0]
      );
    }
  }
  function lampPostGeometry(point, style, addTriangle) {
    const color = parseColor(5264986), radius = style.poleRadius;
    if (!Number.isFinite(radius) || radius <= 0) throw new Error("Invalid lamp pole radius");
    const ring = (r) => Array.from({ length: 6 }, (_, i) => ({
      x: point.x + Math.cos(i * Math.PI / 3) * r,
      y: point.y + Math.sin(i * Math.PI / 3) * r,
      ground: point.ground,
      uv: [3, 3]
    }));
    const center = { ...point, uv: [3, 3] };
    for (const [r, low, high] of [[radius, 0, style.top], [radius * 2.5, style.top - 0.25, style.top + 0.15]]) {
      const points = ring(r);
      for (let i = 0; i < 6; i++) {
        const a = points[i], b = points[(i + 1) % 6], angle = (i + 0.5) * Math.PI / 3;
        const nx = Math.cos(angle), nz = -Math.sin(angle);
        addTriangle(a, low, b, low, b, high, nx, 0, nz, color);
        addTriangle(a, low, b, high, a, high, nx, 0, nz, color);
        addTriangle(center, high, a, high, b, high, 0, 1, 0, color);
        addTriangle(center, low, b, low, a, low, 0, -1, 0, color);
      }
    }
  }
  function computeBounds(geometry) {
    const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity], data = geometry.attributes.position.data;
    for (let i = 0; i < data.length; i++) {
      min[i % 3] = Math.min(min[i % 3], data[i]);
      max[i % 3] = Math.max(max[i % 3], data[i]);
    }
    const center = min.map((v, i) => (v + max[i]) / 2);
    let radius = 0;
    for (let i = 0; i < data.length; i += 3) {
      radius = Math.max(radius, Math.hypot(
        data[i] - center[0],
        data[i + 1] - center[1],
        data[i + 2] - center[2]
      ));
    }
    geometry.bounds = { min, max, center, radius };
  }
  var init_geometry = __esm({
    "src/utils/geometry.js"() {
    }
  });

  // src/utils/shaders.js
  function materialShaders(material = {}, sparkle = false, elevationWGSL = "") {
    const hasBase = Boolean(material.baseTexture);
    const hasMetal = Boolean(material.metalTexture);
    const hasEmissive = Boolean(material.emissiveTexture);
    const hasOcclusion = Boolean(material.occlusionTexture);
    const hasRoof = Boolean(material.roofTexture);
    const hasTerrain = Boolean(material.terrain);
    const textured = hasBase || hasMetal || hasEmissive || hasOcclusion || material.nightLight;
    const vertex = `
    struct Mesh {
      worldMatrix: mat4x4<f32>,
      baseColor: vec4<f32>,
      material: vec4<f32>,
      emissive: vec4<f32>,
      terrain: vec4<f32>,
      highlight: vec4<f32>,
    };
    struct Frame {
      viewMatrix: mat4x4<f32>,
      projectionMatrix: mat4x4<f32>,
      roofMatrix: mat4x4<f32>,
      lightDirection: vec4<f32>,
      skyDirection: vec4<f32>,
      atmosphereTint: vec4<f32>,
    };
    @group(0) @binding(0) var<uniform> u: Mesh;
    @group(0) @binding(1) var<uniform> frame: Frame;
    struct Solar { matrix: mat4x4<f32>, params: vec4<f32> };
    @group(1) @binding(0) var<uniform> solar: Solar;
    ${hasTerrain ? `@group(0) @binding(2) var dem: texture_2d<f32>;${elevationWGSL}` : ""}
    struct VertexInput {
      @location(0) position: vec3<f32>,
      @location(1) normal: vec3<f32>,
      ${material.vertexColors ? "@location(2) color: vec3<f32>," : ""}
      ${textured ? "@location(3) uv: vec2<f32>," : ""}
    };
    struct VertexOutput {
      @builtin(position) position: vec4<f32>,
      @location(0) color: vec3<f32>,
      @location(1) normal: vec3<f32>,
      @location(2) viewPosition: vec3<f32>,
      @location(6) shadowPosition: vec4<f32>,
      @location(7) worldPosition: vec3<f32>,
      ${sparkle ? "@location(8) localPosition: vec3<f32>," : ""}
      ${textured ? "@location(3) uv: vec2<f32>," : ""}
      ${hasRoof ? "@location(4) roofUv: vec2<f32>, @location(5) roof: f32," : ""}
    };
    @vertex fn vertexMain(input: VertexInput, @builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
      var output: VertexOutput;
      var position = input.position;
      ${hasTerrain ? "position.y = elevation(u.terrain.xy + input.uv * u.terrain.z, u.terrain.w) - u.terrain.w;" : ""}
      let highlighted = f32(vertexIndex) >= u.highlight.x && f32(vertexIndex) < u.highlight.y;
      output.color = ${material.vertexColors ? "select(input.color, vec3<f32>(72.0 / 255.0, 217.0 / 255.0, 1.0), highlighted)" : "u.baseColor.rgb"};
      // Inverse-transpose from cofactors; the camera view matrix is orthonormal.
      let m = mat3x3<f32>(u.worldMatrix[0].xyz, u.worldMatrix[1].xyz, u.worldMatrix[2].xyz);
      let normal = (cross(m[1], m[2]) * input.normal.x + cross(m[2], m[0]) * input.normal.y +
        cross(m[0], m[1]) * input.normal.z) / determinant(m);
      output.normal = (frame.viewMatrix * vec4<f32>(normal, 0.0)).xyz;
      let world = u.worldMatrix * vec4<f32>(position, 1.0);
      output.shadowPosition = solar.matrix * world;
      output.worldPosition = world.xyz / world.w;
      ${sparkle ? "output.localPosition = input.position;" : ""}
      let viewPosition = frame.viewMatrix * world;
      output.viewPosition = viewPosition.xyz;
      ${textured ? "output.uv = input.uv;" : ""}
      ${hasRoof ? `
        output.roofUv = (frame.roofMatrix * world).xz;
        output.roof = select(0.0, 1.0, input.normal.y >= 0.5 && !highlighted);
      ` : ""}
      output.position = frame.projectionMatrix * viewPosition;
      return output;
    }
  `;
    const bindings = [];
    let binding = 3;
    const textureBinding = (name, enabled) => {
      if (!enabled) return "";
      bindings.push({ name, texture: binding, sampler: binding + 1 });
      const current = binding;
      binding += 2;
      return `@group(0) @binding(${current}) var ${name}: texture_2d<f32>;
      @group(0) @binding(${current + 1}) var ${name}Sampler: sampler;`;
    };
    const baseBinding = textureBinding("baseTexture", hasBase);
    const metalBinding = textureBinding("metalTexture", hasMetal);
    const emissiveBinding = textureBinding("emissiveTexture", hasEmissive);
    const occlusionBinding = textureBinding("occlusionTexture", hasOcclusion);
    const roofBinding = textureBinding("roofTexture", hasRoof);
    const fragment = `
    struct Mesh {
      worldMatrix: mat4x4<f32>,
      baseColor: vec4<f32>,
      material: vec4<f32>,
      emissive: vec4<f32>,
      terrain: vec4<f32>,
      highlight: vec4<f32>,
    };
    struct Frame {
      viewMatrix: mat4x4<f32>,
      projectionMatrix: mat4x4<f32>,
      roofMatrix: mat4x4<f32>,
      lightDirection: vec4<f32>,
      skyDirection: vec4<f32>,
      atmosphereTint: vec4<f32>,
    };
    struct Solar {
      matrix: mat4x4<f32>,
      params: vec4<f32>,
    };
    @group(0) @binding(0) var<uniform> u: Mesh;
    @group(0) @binding(1) var<uniform> frame: Frame;
    @group(1) @binding(0) var<uniform> solar: Solar;
    @group(1) @binding(1) var shadowTexture: texture_depth_2d;
    @group(1) @binding(2) var shadowSampler: sampler_comparison;
    @group(1) @binding(3) var<storage, read> lightGrid: array<vec4<f32>>;
    ${baseBinding}${metalBinding}${emissiveBinding}${occlusionBinding}${roofBinding}
    struct FragmentInput {
      @location(0) color: vec3<f32>,
      @location(1) normal: vec3<f32>,
      @location(2) viewPosition: vec3<f32>,
      @location(6) shadowPosition: vec4<f32>,
      @location(7) worldPosition: vec3<f32>,
      ${sparkle ? "@location(8) localPosition: vec3<f32>," : ""}
      ${textured ? "@location(3) uv: vec2<f32>," : ""}
      ${hasRoof ? "@location(4) roofUv: vec2<f32>, @location(5) roof: f32," : ""}
    };
    const PI: f32 = 3.14159265;
    fn toLinear(c: vec3<f32>) -> vec3<f32> {
      return select(c / 12.92, pow((c + vec3<f32>(0.055)) / 1.055, vec3<f32>(2.4)), c >= vec3<f32>(0.04045));
    }
    fn toSRGB(c: vec3<f32>) -> vec3<f32> {
      return select(c * 12.92, 1.055 * pow(max(c, vec3<f32>(0.0)), vec3<f32>(1.0 / 2.4)) - vec3<f32>(0.055), c >= vec3<f32>(0.0031308));
    }
    fn sunVisibility(position: vec4<f32>) -> f32 {
      let p = position.xyz / position.w;
      let uv = vec2<f32>(p.x * 0.5 + 0.5, 0.5 - p.y * 0.5);
      if (solar.params.x < 0.5 || any(uv < vec2<f32>(0.0)) || any(uv > vec2<f32>(1.0)) || p.z < 0.0 || p.z > 1.0) {
        return 1.0;
      }
      return textureSampleCompareLevel(shadowTexture, shadowSampler, uv, p.z - 0.0003);
    }
    fn localLighting(position: vec3<f32>, normal: vec3<f32>) -> vec3<f32> {
      if (frame.skyDirection.w <= 0.0 || lightGrid[0].w < 1.0) { return vec3<f32>(0.0); }
      let cell = vec2<i32>(floor((position.xz - lightGrid[0].xy) / lightGrid[0].z));
      if (any(cell < vec2<i32>(0)) || cell.x >= i32(lightGrid[0].w) || cell.y >= i32(lightGrid[1].x)) {
        return vec3<f32>(0.0);
      }
      let header = lightGrid[2u + u32(cell.y) * u32(lightGrid[0].w) + u32(cell.x)];
      var light = vec3<f32>(0.0);
      for (var i = 0u; i < u32(header.y); i++) {
        let source = lightGrid[u32(header.x) + i * 2u];
        let colour = lightGrid[u32(header.x) + i * 2u + 1u];
        let delta = source.xyz - position;
        let distance2 = max(dot(delta, delta), 1.0);
        let falloff = max(0.0, 1.0 - distance2 / (source.w * source.w));
        let lambert = max(0.0, dot(normal, delta / sqrt(distance2)));
        light += toLinear(colour.rgb) * colour.w * lambert * falloff * falloff / distance2;
      }
      return light * frame.skyDirection.w;
    }
    @fragment fn fragmentMain(input: FragmentInput, @builtin(front_facing) frontFacing: bool) -> @location(0) vec4<f32> {
      ${material.nightLight ? `
        if (input.uv.x <= 2.0) {
        let radial = max(0.0, 1.0 - dot(input.uv, input.uv));
        let alpha = radial * radial * frame.skyDirection.w * 0.65;
        if (alpha < 0.005) { discard; }
        return vec4<f32>(input.color, alpha);
        }
      ` : ""}
      let sunlight = sunVisibility(input.shadowPosition);
      let worldNormal = normalize(transpose(mat3x3<f32>(frame.viewMatrix[0].xyz, frame.viewMatrix[1].xyz, frame.viewMatrix[2].xyz)) * normalize(input.normal)) * select(-1.0, 1.0, frontFacing);
      let artificial = localLighting(input.worldPosition, worldNormal);
      ${material.unlit ? `
        let rasterTexel = textureSample(baseTexture, baseTextureSampler, input.uv);
        return vec4<f32>(toSRGB(toLinear(rasterTexel.rgb) * (frame.atmosphereTint.rgb * (0.55 + 0.45 * sunlight) + artificial)), ${material.alphaMode === "BLEND" ? "u.material.z * rasterTexel.a" : "1.0"});
      ` : `
      var normal = normalize(input.normal) * select(-1.0, 1.0, frontFacing);
      let texel = ${hasBase ? "textureSample(baseTexture, baseTextureSampler, input.uv)" : "vec4<f32>(1.0)"};
      let alpha = u.material.z * texel.a;
      ${material.alphaMode === "MASK" ? "if (alpha < u.material.w) { discard; }" : ""}
      ${material.alphaMode === "BLEND" ? "if (alpha < 0.01) { discard; }" : ""}
      var base = ${material.vertexColors ? "toLinear(min(input.color, vec3<f32>(1.0)))" : "input.color"} *
        ${material.baseTexture?.srgb ? "texel.rgb" : "toLinear(texel.rgb)"};
      ${hasRoof ? `
        if (input.roof > 0.5 && all(input.roofUv >= vec2<f32>(0.0)) &&
          all(input.roofUv <= vec2<f32>(1.0))) {
          let roof = textureSampleLevel(roofTexture, roofTextureSampler, input.roofUv, 0.0);
          base = mix(base, toLinear(roof.rgb), roof.a);
        }
      ` : ""}
      let mr = ${hasMetal ? "textureSample(metalTexture, metalTextureSampler, input.uv)" : "vec4<f32>(1.0)"};
      let metal = clamp(u.material.x * mr.b, 0.0, 1.0);
      let rough = clamp(u.material.y * mr.g, 0.08, 1.0);
      let view = normalize(-input.viewPosition);
      let halfVector = normalize(view + frame.lightDirection.xyz);
      let nl = max(dot(normal, frame.lightDirection.xyz), 0.0) * frame.lightDirection.w * sunlight;
      let nv = max(dot(normal, view), 0.001);
      let nh = max(dot(normal, halfVector), 0.0);
      let vh = max(dot(view, halfVector), 0.0);
      let a2 = pow(rough, 4.0);
      let d = a2 / max(PI * pow(nh * nh * (a2 - 1.0) + 1.0, 2.0), 0.0001);
      let gv = nl * sqrt(nv * nv * (1.0 - a2) + a2);
      let gl = nv * sqrt(nl * nl * (1.0 - a2) + a2);
      let visibility = 0.5 / max(gv + gl, 0.0001);
      let f0 = mix(vec3<f32>(0.04), base, metal);
      let fresnel = f0 + (1.0 - f0) * pow(1.0 - vh, 5.0);
      let specular = d * visibility * fresnel;
      let diffuse = (1.0 - metal) * base / PI;
      let sky = dot(normal, frame.skyDirection.xyz) * 0.5 + 0.5;
      let ambient = mix(toLinear(vec3<f32>(0.455, 0.412, 0.322)), vec3<f32>(1.0), sky) * (2.0 / PI);
      let ao = ${hasOcclusion ? "mix(1.0, textureSample(occlusionTexture, occlusionTextureSampler, input.uv).r, u.emissive.w)" : "1.0"};
      ${sparkle ? `
        let lattice = (fract(input.localPosition / 2.5) - 0.5) * 2.5;
        let pointGlow = (1.0 - smoothstep(0.16, 0.42, length(lattice))) * u.highlight.z;
      ` : ""}
      // Vertex colour components above 1 are self-lit (e.g. vehicle lamps): dim by day, bright at night.
      let glow = ${sparkle ? "vec3<f32>(3.0, 2.6, 1.8) * pointGlow +" : ""}${material.vertexColors ? " max(input.color - vec3<f32>(1.0), vec3<f32>(0.0)) * (0.3 + 5.0 * frame.skyDirection.w) +" : ""} u.emissive.rgb * ${hasEmissive ? material.emissiveTexture.srgb ? "textureSample(emissiveTexture, emissiveTextureSampler, input.uv).rgb" : "toLinear(textureSample(emissiveTexture, emissiveTextureSampler, input.uv).rgb)" : "vec3<f32>(1.0)"};
      var color = ambient * base * (1.0 - metal) * ao +
        (diffuse + specular) * nl * toLinear(vec3<f32>(1.0, 0.937, 0.835)) * 3.0 + glow;
      ${material.vertexColors ? "color = base * (ambient + toLinear(vec3<f32>(1.0, 0.937, 0.835)) * (3.0 / PI) * nl) + glow;" : ""}
      color = (color - glow) * frame.atmosphereTint.rgb + base * artificial * (1.0 - metal * 0.5) + glow;
      return vec4<f32>(toSRGB(color), ${material.alphaMode === "BLEND" ? "alpha" : "1.0"});
      `}
    }
  `;
    return { vertex, fragment, bindings, textured, hasTerrain };
  }
  var init_shaders = __esm({
    "src/utils/shaders.js"() {
    }
  });

  // src/utils/scene.js
  function setParent(node, parent) {
    if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1);
    node.parent = parent;
    if (parent) parent.children.push(node);
  }
  function traverse(node, callback) {
    if (callback(node)) return;
    for (const child of node.children) traverse(child, callback);
  }
  function updateWorldMatrix(node) {
    const parent = node.parent;
    const parentVersion = parent?._worldMatrixVersion || 0;
    const matrixMode = Boolean(node.matrix);
    let changed = node._worldParent !== parent || node._parentWorldVersion !== parentVersion || node._worldMatrixMode !== matrixMode;
    if (node.matrix) {
      const state = node._matrixState ||= new Float64Array(16);
      for (let i = 0; i < 16; i++) {
        if (state[i] !== node.matrix[i]) changed = true;
        state[i] = node.matrix[i];
      }
    } else {
      const state = node._transformState ||= new Float64Array(9);
      for (let i = 0; i < 9; i++) {
        const value = i < 3 ? node.position[i] : i < 6 ? node.rotation[i - 3] : node.scale[i - 6];
        if (state[i] !== value) changed = true;
        state[i] = value;
      }
    }
    if (!changed) {
      for (const child of node.children) updateWorldMatrix(child);
      return;
    }
    let local;
    if (node.matrix) local = node.matrix;
    else {
      const degrees = 180 / Math.PI;
      const matrix = new DOMMatrix().translate(...node.position);
      matrix.rotateAxisAngleSelf(0, 1, 0, node.rotation[1] * degrees);
      matrix.rotateAxisAngleSelf(1, 0, 0, node.rotation[0] * degrees);
      matrix.rotateAxisAngleSelf(0, 0, 1, node.rotation[2] * degrees);
      local = matrix.scale(...node.scale).toFloat64Array();
    }
    const world = parent ? new DOMMatrix(parent.worldMatrix).multiply(new DOMMatrix(local)).toFloat64Array() : local;
    for (let i = 0; i < 16; i++) node.worldMatrix[i] = world[i];
    node._worldParent = parent;
    node._parentWorldVersion = parentVersion;
    node._worldMatrixMode = matrixMode;
    node._worldMatrixVersion = (node._worldMatrixVersion || 0) + 1;
    for (const child of node.children) updateWorldMatrix(child);
  }
  function updateCamera(camera) {
    const z = camera.position.map((v, i) => v - camera.target[i]);
    const zLength = Math.hypot(...z) || 1;
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    for (let i = 0; i < 3; i++) {
      z[i] /= zLength;
    }
    const x = cross(camera.up, z), xLength = Math.hypot(...x) || 1;
    for (let i = 0; i < 3; i++) {
      x[i] /= xLength;
    }
    const y = cross(z, x);
    const view = new DOMMatrix([x[0], x[1], x[2], 0, y[0], y[1], y[2], 0, z[0], z[1], z[2], 0, ...camera.position, 1]).inverse().toFloat64Array();
    if (![...view].every(Number.isFinite)) {
      throw new Error("Singular 3D transform");
    }
    for (let i = 0; i < 16; i++) {
      camera.viewMatrix[i] = view[i];
    }
    const f = 1 / Math.tan(camera.fov * Math.PI / 360), n = camera.near, r = camera.far;
    const projection = [f / camera.aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, r / (n - r), -1, 0, 0, r * n / (n - r), 0];
    for (let i = 0; i < 16; i++) {
      camera.projectionMatrix[i] = projection[i];
    }
    const projectionView = new DOMMatrix(camera.projectionMatrix).multiply(new DOMMatrix(camera.viewMatrix)).toFloat64Array();
    for (let i = 0; i < 16; i++) {
      camera.projectionViewMatrix[i] = projectionView[i];
    }
  }
  var emptyNode;
  var init_scene = __esm({
    "src/utils/scene.js"() {
      emptyNode = () => ({
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        worldMatrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
        children: [],
        visible: true
      });
    }
  });

  // src/scene/gpu.js
  async function attach(backend, map) {
    let shared = L.Layer.types["3d"]._renderers.get(map);
    if (shared?._rendererReady) {
      await shared._rendererReady.promise;
    }
    if (!shared) {
      const rendererReady = Promise.withResolvers();
      shared = backend;
      backend._rendererReady = rendererReady;
      rendererReady.promise.catch(() => {
      });
      L.Layer.types["3d"]._renderers.set(map, shared);
      const fail = (error) => {
        rendererReady.reject(error);
        L.Layer.types["3d"]._renderers.delete(map);
        throw error;
      };
      const canvas = document.createElement("canvas");
      if (!navigator.gpu) fail(new Error("Layer3D requires WebGPU"));
      const adapter = await navigator.gpu.requestAdapter().catch(fail);
      if (!adapter) fail(new Error("Unable to acquire a WebGPU adapter"));
      const device = await adapter.requestDevice().catch(fail);
      device.addEventListener("uncapturederror", (event) => {
        const owner = L.Layer.types["3d"]._renderers.get(map);
        for (const layer of owner?._layers || []) layer.fire("error", { error: event.error });
      });
      device.lost.then((info) => {
        const owner = L.Layer.types["3d"]._renderers.get(map);
        if (!owner) return;
        const error = new Error(`WebGPU device lost: ${info.message || info.reason}`);
        for (const layer of owner._layers) layer.fire("error", { error });
      });
      const context = canvas.getContext("webgpu");
      if (!context) {
        device.destroy();
        fail(new Error("Unable to create a WebGPU canvas context"));
      }
      const format = navigator.gpu.getPreferredCanvasFormat();
      context.configure({ device, format, alphaMode: "premultiplied" });
      backend._shared = backend;
      backend._layers = /* @__PURE__ */ new Set();
      backend._sceneOrigin = backend.location;
      backend.scene = emptyNode();
      backend.camera = {
        position: [0, 0, 0],
        up: [0, 1, 0],
        target: [0, 0, 0],
        viewMatrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
        projectionMatrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
        projectionViewMatrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
        fov: 45,
        aspect: 1,
        near: 0.1,
        far: 1e4
      };
      backend.renderer = { device, context, format, canvas, dpr: Math.min(window.devicePixelRatio, 2) };
      backend._initSunlight();
      const emptyImage = document.createElement("canvas");
      emptyImage.width = 1;
      emptyImage.height = 1;
      backend.renderer.roofFallbackTexture = {
        device,
        texture: device.createTexture({
          size: [1, 1],
          format: "rgba8unorm",
          usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
        }),
        sampler: device.createSampler({
          addressModeU: "clamp-to-edge",
          addressModeV: "clamp-to-edge"
        }),
        image: emptyImage,
        format: "rgba8unorm",
        srgb: false,
        uploaded: null
      };
      shared._size = null;
      canvas.className = "leaflet-3d";
      canvas.style.cssText = "position:absolute;top:0;left:0;pointer-events:none";
      canvas.setAttribute("role", "img");
      canvas.setAttribute("aria-label", backend.options.ariaLabel);
      let pane = map.getPane("webgpuPane");
      if (!pane) {
        pane = map.createPane("webgpuPane", map.getContainer());
        pane.style.zIndex = 450;
      }
      pane.append(canvas);
      map.on("move zoom rotate pitch resize viewreset layeradd layerremove", shared._onMapChange, shared);
      map.on("zoomstart", shared._startZoom, shared);
      map.on("zoomanim", shared.update, shared);
      map.on("zoomend", shared._endZoom, shared);
      rendererReady.resolve();
      delete shared._rendererReady;
      shared._render();
      L.Layer.types["3d"]._renderers.set(map, shared);
    }
    const origin = map.options.crs.project(shared._sceneOrigin);
    const point = map.options.crs.project(backend.location);
    const metres = Math.cos(shared._sceneOrigin.lat * Math.PI / 180);
    backend._terrainBaseY ??= backend.root.position[1];
    backend.root.position[0] = (point.x - origin.x) * metres;
    backend.root.position[1] = backend._terrainBaseY;
    backend.root.position[2] = -(point.y - origin.y) * metres;
    backend._setTerrainHeight();
    backend.root.scale.fill(metres / Math.cos(backend.location.lat * Math.PI / 180));
    backend._shared = shared;
    backend.renderer = shared.renderer;
    backend.scene = shared.scene;
    backend.camera = shared.camera;
    shared._layers.add(backend);
    setParent(backend.root, shared.scene);
    traverse(backend.root, (object) => {
      if (object.geometry && object.geometry.device !== shared.renderer.device) {
        const geometry = object.geometry;
        const material = object.program._layerMaterial;
        const attributes = {};
        for (const name of ["position", "normal", "color", "uv", "index"]) {
          const attribute = geometry.attributes[name];
          if (!attribute) continue;
          const { data, size, count, normalized } = attribute;
          attributes[name] = { data: data.slice(0, count * size), size, normalized };
        }
        const device = shared.renderer.device;
        if (attributes.index?.data instanceof Uint8Array) {
          attributes.index.data = Uint16Array.from(attributes.index.data);
        }
        for (const [name, attribute] of Object.entries(attributes)) {
          attribute.size ||= 1;
          attribute.count = attribute.data.length / attribute.size;
          attribute.indexFormat = attribute.data instanceof Uint32Array ? "uint32" : "uint16";
          attribute.buffer = device.createBuffer({
            size: Math.max(4, attribute.data.byteLength),
            usage: name === "index" ? GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST : GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
          });
          device.queue.writeBuffer(attribute.buffer, 0, attribute.data);
        }
        object.geometry = {
          device,
          attributes,
          drawRange: { start: 0, count: attributes.index?.count || attributes.position.count }
        };
        for (const attribute of Object.values(geometry.attributes)) attribute.buffer.destroy();
        object.bindGroup = null;
        object.boundTextures = [];
        for (const key of ["baseTexture", "metalTexture", "emissiveTexture", "occlusionTexture"]) {
          const texture = material[key];
          if (!texture || texture.device === device) continue;
          material[key] = {
            ...texture,
            device,
            texture: device.createTexture({
              size: [texture.image.width, texture.image.height],
              format: texture.format,
              usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
            }),
            sampler: device.createSampler(texture.samplerOptions),
            uploaded: null
          };
        }
        backend._removeProgram(object.program);
        object.program = backend._createProgram(material);
        object.device = device;
      }
      if (object.texture && object.texture.device !== shared.renderer.device) {
        object.texture = {
          ...object.texture,
          device: shared.renderer.device,
          texture: shared.renderer.device.createTexture({
            size: [object.texture.image.width, object.texture.image.height],
            format: object.texture.format,
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
          }),
          sampler: shared.renderer.device.createSampler(object.texture.samplerOptions),
          uploaded: null
        };
      }
    });
    shared.update();
    if (backend.header) backend._updateArea();
  }
  function destroyTexture(backend, texture) {
    backend.renderer.device.queue.onSubmittedWorkDone().then(() => texture.destroy(), (error) => {
      backend.fire("error", { error });
      texture.destroy();
    });
  }
  function createProgram(backend, material = {}) {
    const device = backend.renderer.device;
    const sparkle = Boolean(backend.options.nightSparkle);
    const shaders = materialShaders(material, sparkle, material.terrain ? L.Layer.types.terrain.elevationWGSL : "");
    const { bindings, textured, hasTerrain } = shaders;
    const vertex = device.createShaderModule({ code: shaders.vertex });
    const fragment = device.createShaderModule({ code: shaders.fragment });
    Promise.all([vertex.getCompilationInfo(), fragment.getCompilationInfo()]).then((infos) => {
      const errors = infos.flatMap((info) => info.messages).filter((message) => message.type === "error");
      if (errors.length) {
        backend.fire("error", {
          error: new Error(`Unable to compile Layer3D WGSL: ${errors.map((error) => error.message).join("\n")}`)
        });
      }
    }).catch((error) => backend.fire("error", { error }));
    const vertexBuffers = [
      { arrayStride: 12, attributes: [{ shaderLocation: 0, offset: 0, format: "float32x3" }] },
      { arrayStride: 12, attributes: [{ shaderLocation: 1, offset: 0, format: "float32x3" }] },
      material.vertexColors ? { arrayStride: 12, attributes: [{ shaderLocation: 2, offset: 0, format: "float32x3" }] } : null,
      textured ? { arrayStride: 8, attributes: [{ shaderLocation: 3, offset: 0, format: "float32x2" }] } : null
    ];
    const bindGroupEntries = [{
      binding: 0,
      visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
      buffer: { type: "uniform", hasDynamicOffset: true }
    }, {
      binding: 1,
      visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
      buffer: { type: "uniform" }
    }];
    if (hasTerrain) {
      bindGroupEntries.push({
        binding: 2,
        visibility: GPUShaderStage.VERTEX,
        texture: { sampleType: "unfilterable-float", viewDimension: "2d" }
      });
    }
    for (const texture of bindings) {
      bindGroupEntries.push({
        binding: texture.texture,
        visibility: GPUShaderStage.FRAGMENT,
        texture: { sampleType: "float", viewDimension: "2d" }
      });
      bindGroupEntries.push({
        binding: texture.sampler,
        visibility: GPUShaderStage.FRAGMENT,
        sampler: { type: "filtering" }
      });
    }
    const bindGroupLayout = device.createBindGroupLayout({ entries: bindGroupEntries });
    const pipelineLayout = device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout, backend.renderer.sunlight.layout] });
    return {
      device,
      vertex,
      fragment,
      bindings,
      vertexBuffers,
      bindGroupLayout,
      pipelineLayout,
      pipelineCache: /* @__PURE__ */ new Map(),
      cullMode: material.doubleSided ? "none" : "back",
      transparent: material.alphaMode === "BLEND",
      depthWrite: material.alphaMode !== "BLEND",
      depthTest: material.depthTest !== false,
      terrain: material.terrain,
      nightLight: Boolean(material.nightLight),
      nightSparkle: sparkle,
      uniforms: {
        baseColor: { value: material.color || [1, 1, 1] },
        metallic: { value: material.metallic ?? 0 },
        roughness: { value: material.roughness ?? 0.85 },
        opacity: { value: material.opacity ?? 1 },
        alphaCutoff: { value: material.alphaCutoff ?? 0.5 },
        occlusionStrength: { value: material.occlusionStrength ?? 1 },
        emissive: { value: material.emissive || [0, 0, 0] },
        ...material.baseTexture ? { baseTexture: { value: material.baseTexture } } : {},
        ...material.metalTexture ? { metalTexture: { value: material.metalTexture } } : {},
        ...material.emissiveTexture ? { emissiveTexture: { value: material.emissiveTexture } } : {},
        ...material.occlusionTexture ? { occlusionTexture: { value: material.occlusionTexture } } : {},
        ...material.roofTexture ? { roofTexture: { value: null } } : {}
      },
      _layerMaterial: material
    };
  }
  function removeProgram(program) {
    program.pipelineCache.clear();
  }
  function createMesh(backend, data, material = {}, usage = 0) {
    const { device } = backend.renderer, attributes = {};
    for (const [name, values] of Object.entries(data)) {
      const array = new Float32Array(values);
      const buffer = device.createBuffer({ size: Math.max(4, array.byteLength), usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST | usage });
      device.queue.writeBuffer(buffer, 0, array);
      attributes[name] = { size: 3, data: array, count: array.length / 3, buffer };
    }
    const mesh = {
      ...emptyNode(),
      device,
      geometry: { device, attributes, drawRange: { start: 0, count: attributes.position.count } },
      program: backend._createProgram({ vertexColors: true, doubleSided: true, ...material }),
      id: L.Layer.types["3d"]._nextId++,
      renderOrder: 0,
      extras: {}
    };
    backend.add(mesh);
    return mesh;
  }
  function disposeMesh(backend, mesh) {
    if (!mesh) return;
    backend.remove(mesh);
    for (const attribute of Object.values(mesh.geometry.attributes)) attribute.buffer.destroy();
    backend._removeProgram(mesh.program);
  }
  function drawGeometry(backend, mesh, pass, cullMode, frontFace) {
    const { geometry, program } = mesh;
    const device = backend.renderer.device;
    const pipelineKey = `${cullMode}:${frontFace}`;
    let pipeline = program.pipelineCache.get(pipelineKey);
    if (!pipeline) {
      pipeline = device.createRenderPipeline({
        layout: program.pipelineLayout,
        vertex: {
          module: program.vertex,
          entryPoint: "vertexMain",
          buffers: program.vertexBuffers
        },
        fragment: {
          module: program.fragment,
          entryPoint: "fragmentMain",
          targets: [{
            format: backend.renderer.format,
            blend: program.transparent ? {
              color: { srcFactor: "src-alpha", dstFactor: "one-minus-src-alpha", operation: "add" },
              alpha: { srcFactor: "one", dstFactor: "one-minus-src-alpha", operation: "add" }
            } : void 0,
            writeMask: GPUColorWrite.ALL
          }]
        },
        primitive: { topology: "triangle-list", cullMode, frontFace },
        depthStencil: {
          format: "depth24plus",
          depthWriteEnabled: program.depthWrite,
          depthCompare: program.depthTest === false ? "always" : "less-equal"
        }
      });
      program.pipelineCache.set(pipelineKey, pipeline);
    }
    const uniforms = program.uniforms;
    const renderer = backend.renderer;
    const offset = renderer.uniformSlot++ * 256;
    const data = renderer.uniformData, base = offset / 4;
    data.set(mesh.worldMatrix, base);
    data.set(uniforms.baseColor.value, base + 16);
    data[base + 19] = 1;
    data[base + 20] = uniforms.metallic.value;
    data[base + 21] = uniforms.roughness.value;
    data[base + 22] = uniforms.opacity.value;
    data[base + 23] = uniforms.alphaCutoff.value;
    data.set(uniforms.emissive.value, base + 24);
    data[base + 27] = uniforms.occlusionStrength.value;
    data[base + 28] = mesh.terrain?.[0] ?? 0;
    data[base + 29] = mesh.terrain?.[1] ?? 0;
    data[base + 30] = mesh.terrain?.[2] ?? 0;
    data[base + 31] = mesh.terrain?.[3] ?? 0;
    data[base + 32] = mesh.highlight?.[0] ?? 0;
    data[base + 33] = mesh.highlight?.[1] ?? 0;
    data[base + 34] = program.nightSparkle ? data[55] : 0;
    data[base + 35] = 0;
    const textures = mesh._textures ||= [];
    textures.length = 0;
    for (const binding of program.bindings) {
      const texture = uniforms[binding.name]?.value;
      if (!texture) throw new Error(`Missing Layer3D texture: ${binding.name}`);
      if (texture.uploaded !== texture.image) {
        device.queue.copyExternalImageToTexture(
          { source: texture.image, flipY: Boolean(texture.flipY) },
          { texture: texture.texture },
          [texture.image.width, texture.image.height]
        );
        texture.uploaded = texture.image;
      }
      textures.push(texture);
    }
    let bindingsChanged = !mesh.bindGroup || mesh.boundBuffer !== renderer.uniformBuffer || textures.length !== mesh.boundTextures.length;
    for (let i = 0; !bindingsChanged && i < textures.length; i++) {
      if (textures[i].texture !== mesh.boundTextures[i][0] || textures[i].sampler !== mesh.boundTextures[i][1]) bindingsChanged = true;
    }
    if (bindingsChanged) {
      const entries = [
        { binding: 0, resource: { buffer: renderer.uniformBuffer, size: 144 } },
        { binding: 1, resource: { buffer: renderer.uniformBuffer, size: 240 } }
      ];
      if (program.terrain) entries.push({ binding: 2, resource: program.terrain.texture.createView() });
      mesh.boundBuffer = renderer.uniformBuffer;
      const boundTextures = mesh.boundTextures ||= [];
      boundTextures.length = textures.length;
      for (let i = 0; i < textures.length; i++) {
        const binding = program.bindings[i], texture = textures[i];
        entries.push({ binding: binding.texture, resource: texture.texture.createView() });
        entries.push({ binding: binding.sampler, resource: texture.sampler });
        boundTextures[i] ||= [];
        boundTextures[i][0] = texture.texture;
        boundTextures[i][1] = texture.sampler;
      }
      mesh.bindGroup = device.createBindGroup({
        layout: program.bindGroupLayout,
        entries
      });
    }
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, mesh.bindGroup, [offset]);
    pass.setVertexBuffer(0, geometry.attributes.position.buffer);
    pass.setVertexBuffer(1, geometry.attributes.normal.buffer);
    if (geometry.attributes.color) pass.setVertexBuffer(2, geometry.attributes.color.buffer);
    if (geometry.attributes.uv) pass.setVertexBuffer(3, geometry.attributes.uv.buffer);
    for (const attribute of Object.values(geometry.attributes)) {
      if (!attribute.needsUpdate) continue;
      device.queue.writeBuffer(attribute.buffer, 0, attribute.data);
      attribute.needsUpdate = false;
      geometry.bounds = null;
    }
    const index = geometry.attributes.index;
    if (index) {
      pass.setIndexBuffer(index.buffer, index.indexFormat);
      pass.drawIndexed(geometry.drawRange.count, 1, geometry.drawRange.start, 0, 0);
    } else {
      pass.draw(geometry.drawRange.count, 1, geometry.drawRange.start, 0);
    }
  }
  var init_gpu = __esm({
    "src/scene/gpu.js"() {
      init_shaders();
      init_scene();
    }
  });

  // src/utils/lighting.js
  function lightGrid(packed, maxBytes) {
    const count = packed.reduce((sum, values) => sum + values.length / 8, 0), cellSize = 32;
    let data = new Float32Array(8);
    if (count) {
      let minX = Infinity, minZ = Infinity, maxX = -Infinity, maxZ = -Infinity;
      for (const values of packed) for (let i = 0; i < values.length; i += 8) {
        minX = Math.min(minX, values[i] - values[i + 3]);
        maxX = Math.max(maxX, values[i] + values[i + 3]);
        minZ = Math.min(minZ, values[i + 2] - values[i + 3]);
        maxZ = Math.max(maxZ, values[i + 2] + values[i + 3]);
      }
      const columns = Math.ceil((maxX - minX) / cellSize) + 1, rows = Math.ceil((maxZ - minZ) / cellSize) + 1;
      const each = (callback) => {
        for (const values of packed) for (let i = 0; i < values.length; i += 8) {
          const radius = values[i + 3], x = values[i] - minX, z = values[i + 2] - minZ;
          for (let y = Math.floor((z - radius) / cellSize); y <= Math.floor((z + radius) / cellSize); y++) {
            for (let c = Math.floor((x - radius) / cellSize); c <= Math.floor((x + radius) / cellSize); c++) callback(y * columns + c, values, i);
          }
        }
      };
      const counts = new Uint32Array(columns * rows), next = new Uint32Array(columns * rows);
      each((key) => counts[key]++);
      const entries = counts.reduce((sum, value) => sum + value, 0);
      const length = (2 + columns * rows + entries * 2) * 4;
      if (length * 4 > maxBytes) throw new Error("Streetlight grid exceeds GPU storage limit");
      data = new Float32Array(length);
      data.set([minX, minZ, cellSize, columns, rows, count, 0, 0]);
      let offset = 2 + columns * rows;
      for (let key = 0; key < counts.length; key++) if (counts[key]) {
        data[(2 + key) * 4] = next[key] = offset;
        data[(2 + key) * 4 + 1] = counts[key];
        offset += counts[key] * 2;
      }
      each((key, values, i) => {
        for (let j = 0, o = next[key] * 4; j < 8; j++) data[o + j] = values[i + j];
        next[key] += 2;
      });
    }
    return { data, count };
  }
  function worldLights(lights, m) {
    const values = new Float32Array(lights.length * 8);
    lights.forEach(({ position: [x, y, z], radius, color, flux }, i) => {
      const w = m[3] * x + m[7] * y + m[11] * z + m[15];
      values.set([
        (m[0] * x + m[4] * y + m[8] * z + m[12]) / w,
        (m[1] * x + m[5] * y + m[9] * z + m[13]) / w,
        (m[2] * x + m[6] * y + m[10] * z + m[14]) / w,
        radius,
        ...color,
        flux / (4 * Math.PI) * 0.03
      ], i * 8);
    });
    return values;
  }
  var init_lighting = __esm({
    "src/utils/lighting.js"() {
    }
  });

  // src/scene/lighting.js
  function initSunlight(backend) {
    const device = backend.renderer.device;
    const layout = device.createBindGroupLayout({ entries: [
      { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: "uniform" } },
      { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: { sampleType: "depth" } },
      { binding: 2, visibility: GPUShaderStage.FRAGMENT, sampler: { type: "comparison" } },
      { binding: 3, visibility: GPUShaderStage.FRAGMENT, buffer: { type: "read-only-storage" } }
    ] });
    const buffer = device.createBuffer({ size: 80, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    const sampler = device.createSampler({ compare: "less-equal", minFilter: "linear", magFilter: "linear" });
    const lights = device.createBuffer({ size: 32, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
    backend.renderer.sunlight = { layout, buffer, sampler, lights, size: 0 };
    const values = new Float32Array(20);
    values.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    device.queue.writeBuffer(buffer, 0, values);
    backend._resizeSunlight(1);
  }
  function resizeSunlight(backend, size) {
    const device = backend.renderer.device, sun = backend.renderer.sunlight;
    if (sun.size === size) return;
    if (sun.texture) backend._destroyTexture(sun.texture);
    sun.size = size;
    sun.texture = device.createTexture({
      size: [size, size],
      format: "depth32float",
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_SRC
    });
    backend._bindSunlight();
  }
  function bindSunlight(backend) {
    const sun = backend.renderer.sunlight;
    sun.bindGroup = backend.renderer.device.createBindGroup({ layout: sun.layout, entries: [
      { binding: 0, resource: { buffer: sun.buffer } },
      { binding: 1, resource: sun.texture.createView() },
      { binding: 2, resource: sun.sampler },
      { binding: 3, resource: { buffer: sun.lights } }
    ] });
  }
  function updatePointLights(backend) {
    const { device, sunlight: sun } = backend.renderer;
    const meshes = [];
    for (const layer of backend._layers) {
      if (!layer.options.nightLight || !layer.root.visible) continue;
      traverse(layer.root, (mesh) => {
        if (!mesh.visible) return true;
        if (mesh.extras?.lights) meshes.push(mesh);
      });
    }
    if (sun.lightMeshes?.length === meshes.length && meshes.every((mesh, i) => sun.lightMeshes[i].mesh === mesh && sun.lightMeshes[i].lights === mesh.extras.lights && mesh.worldMatrix.every((v, j) => v === sun.lightMeshes[i].matrix[j]))) return;
    const packed = meshes.map((mesh) => {
      const cache = mesh._worldLights, m = mesh.worldMatrix, lights = mesh.extras.lights;
      if (cache?.lights === lights && m.every((v, j) => v === cache.matrix[j])) return cache.data;
      const values = worldLights(lights, m);
      mesh._worldLights = { lights, matrix: [...m], data: values };
      return values;
    });
    const { data, count } = lightGrid(packed, device.limits.maxStorageBufferBindingSize);
    if (sun.lights.size < data.byteLength) {
      backend._destroyTexture(sun.lights);
      sun.lights = device.createBuffer({ size: data.byteLength, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
      backend._bindSunlight();
    }
    device.queue.writeBuffer(sun.lights, 0, data);
    sun.lightCount = count;
    sun.lightMeshes = meshes.map((mesh) => ({ mesh, lights: mesh.extras.lights, matrix: [...mesh.worldMatrix] }));
  }
  function renderSunlight(backend, encoder, meshes, sunlight) {
    const renderer = backend.renderer, device = renderer.device, sun = renderer.sunlight;
    if (!meshes.length || !sunlight || sunlight.altitude < 3) {
      if (!sun.enabled) return;
      const values2 = new Float32Array(20);
      values2.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
      device.queue.writeBuffer(sun.buffer, 0, values2);
      sun.enabled = false;
      return;
    }
    const values = new Float32Array(20);
    sun.enabled = true;
    backend._resizeSunlight(Math.min(2048, device.limits.maxTextureDimension2D));
    const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
    for (const mesh of meshes) {
      if (!mesh.geometry.bounds) computeBounds(mesh.geometry);
      const bounds = mesh.geometry.bounds, matrix = new DOMMatrix(mesh.worldMatrix);
      for (let i = 0; i < 8; i++) {
        const point = new DOMPoint(...min.map((_, axis) => i & 1 << axis ? bounds.max[axis] : bounds.min[axis]), 1).matrixTransform(matrix);
        for (let axis = 0; axis < 3; axis++) {
          const value = [point.x, point.y, point.z][axis] / point.w;
          min[axis] = Math.min(min[axis], value);
          max[axis] = Math.max(max[axis], value);
        }
      }
    }
    min[1] = Math.min(0, min[1]);
    const radius = Math.max(100, Math.hypot(...min.map((v, i) => max[i] - v)));
    const center = min.map((v, i) => (v + max[i]) / 2);
    const lightCamera = {
      position: center.map((v, i) => v + sunlight.direction[i] * radius * 2),
      target: center,
      up: [0, 0, -1],
      fov: 45,
      aspect: 1,
      near: 1,
      far: radius * 5,
      viewMatrix: [],
      projectionMatrix: [],
      projectionViewMatrix: []
    };
    updateCamera(lightCamera);
    const view = new DOMMatrix(lightCamera.viewMatrix);
    const low = [Infinity, Infinity, Infinity], high = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < 8; i++) {
      const point = new DOMPoint(...min.map((v, axis) => i & 1 << axis ? max[axis] : v), 1).matrixTransform(view);
      [point.x, point.y, point.z].forEach((value, axis) => {
        low[axis] = Math.min(low[axis], value - 20);
        high[axis] = Math.max(high[axis], value + 20);
      });
    }
    const span = low.map((v, i) => high[i] - v);
    const projection = new DOMMatrix([
      2 / span[0],
      0,
      0,
      0,
      0,
      2 / span[1],
      0,
      0,
      0,
      0,
      -1 / span[2],
      0,
      -(high[0] + low[0]) / span[0],
      -(high[1] + low[1]) / span[1],
      high[2] / span[2],
      1
    ]);
    values.set(projection.multiply(view).toFloat32Array());
    values[16] = 1;
    device.queue.writeBuffer(sun.buffer, 0, values);
    if (!sun.pipeline) {
      sun.meshLayout = device.createBindGroupLayout({ entries: [
        { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: "uniform", hasDynamicOffset: true } }
      ] });
      sun.depthLayout = device.createBindGroupLayout({ entries: [
        { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: "uniform" } }
      ] });
      sun.depthBindGroup = device.createBindGroup({
        layout: sun.depthLayout,
        entries: [{ binding: 0, resource: { buffer: sun.buffer } }]
      });
      const shader = device.createShaderModule({ code: `
      struct Mesh { world: mat4x4<f32> };
      @group(0) @binding(0) var<uniform> mesh: Mesh;
      @group(1) @binding(0) var<uniform> matrix: mat4x4<f32>;
      @vertex fn main(@location(0) position: vec3<f32>) -> @builtin(position) vec4<f32> {
        return matrix * mesh.world * vec4<f32>(position, 1.0);
      }
    ` });
      sun.pipeline = device.createRenderPipeline({
        layout: device.createPipelineLayout({ bindGroupLayouts: [sun.meshLayout, sun.depthLayout] }),
        vertex: { module: shader, entryPoint: "main", buffers: [
          { arrayStride: 12, attributes: [{ shaderLocation: 0, offset: 0, format: "float32x3" }] }
        ] },
        primitive: { topology: "triangle-list", cullMode: "none" },
        depthStencil: {
          format: "depth32float",
          depthWriteEnabled: true,
          depthCompare: "less",
          depthBias: 2,
          depthBiasSlopeScale: 2
        }
      });
    }
    const pass = encoder.beginRenderPass({
      colorAttachments: [],
      depthStencilAttachment: {
        view: sun.texture.createView(),
        depthClearValue: 1,
        depthLoadOp: "clear",
        depthStoreOp: "store"
      }
    });
    pass.setPipeline(sun.pipeline);
    pass.setBindGroup(1, sun.depthBindGroup);
    for (const mesh of meshes) {
      const offset = renderer.uniformSlot++ * 256;
      renderer.uniformData.set(mesh.worldMatrix, offset / 4);
      if (mesh._shadowBuffer !== renderer.uniformBuffer) {
        mesh._shadowBuffer = renderer.uniformBuffer;
        mesh._shadowBindGroup = device.createBindGroup({ layout: sun.meshLayout, entries: [
          { binding: 0, resource: { buffer: renderer.uniformBuffer, size: 64 } }
        ] });
      }
      for (const attribute of Object.values(mesh.geometry.attributes)) {
        if (attribute.needsUpdate) {
          device.queue.writeBuffer(attribute.buffer, 0, attribute.data);
          attribute.needsUpdate = false;
        }
      }
      pass.setBindGroup(0, mesh._shadowBindGroup, [offset]);
      pass.setVertexBuffer(0, mesh.geometry.attributes.position.buffer);
      const index = mesh.geometry.attributes.index, range = mesh.geometry.drawRange;
      if (index) {
        pass.setIndexBuffer(index.buffer, index.indexFormat);
        pass.drawIndexed(range.count, 1, range.start, 0, 0);
      } else pass.draw(range.count, 1, range.start, 0);
    }
    pass.end();
  }
  var init_lighting2 = __esm({
    "src/scene/lighting.js"() {
      init_lighting();
      init_geometry();
      init_scene();
    }
  });

  // src/utils/model.js
  function decodeModel(data) {
    const view = new DataView(data), decoder = new TextDecoder();
    let description;
    if (view.getUint32(0, true) === 1179937895) {
      if (view.getUint32(4, true) !== 2 || view.getUint32(8, true) !== data.byteLength) {
        throw new Error("Invalid GLB header");
      }
      let binary;
      for (let offset = 12; offset < data.byteLength; ) {
        if (offset + 8 > data.byteLength) {
          throw new Error("Truncated GLB chunk");
        }
        const length = view.getUint32(offset, true), type = view.getUint32(offset + 4, true);
        offset += 8;
        if (offset + length > data.byteLength) {
          throw new Error("Truncated GLB data");
        }
        const chunk = data.slice(offset, offset + length);
        if (type === 1313821514) {
          description = JSON.parse(decoder.decode(chunk));
        }
        if (type === 5130562) {
          binary = chunk;
        }
        offset += length;
      }
      if (!description) {
        throw new Error("Missing GLB JSON");
      }
      if (binary) {
        description.buffers[0].binary = binary;
      }
    } else {
      description = JSON.parse(decoder.decode(data));
    }
    if (description.skins?.length || description.animations?.length || description.extensionsRequired?.length || description.meshes?.some((mesh) => mesh.primitives.some((primitive) => primitive.targets || primitive.mode !== void 0 && primitive.mode !== 4))) {
      throw new Error("Layer3D supports static triangle glTF models without required extensions");
    }
    return description;
  }
  function readAccessor(description, index) {
    const spec = description.accessors[index], Type = types[spec.componentType], size = sizes[spec.type];
    if (!Type || !size || !Number.isInteger(spec.count) || spec.count < 0) {
      throw new Error("Invalid glTF accessor");
    }
    const data = new Type(spec.count * size);
    const read2 = (viewIndex, offset, count, stride, output) => {
      const view = description.bufferViews[viewIndex], bytes = Type.BYTES_PER_ELEMENT;
      const buffer = description.buffers[view.buffer].binary;
      stride ||= size * bytes;
      if (!buffer || stride < size * bytes || offset < 0 || (view.byteOffset || 0) + view.byteLength > buffer.byteLength || (count - 1) * stride + size * bytes + offset > view.byteLength) throw new Error("glTF accessor outside buffer view");
      for (let i = 0; i < count; i++) {
        const values = new Type(buffer.slice(
          (view.byteOffset || 0) + offset + i * stride,
          (view.byteOffset || 0) + offset + i * stride + size * bytes
        ));
        data.set(values, output(i) * size);
      }
    };
    if (spec.bufferView !== void 0) {
      read2(
        spec.bufferView,
        spec.byteOffset || 0,
        spec.count,
        description.bufferViews[spec.bufferView].byteStride,
        (i) => i
      );
    }
    if (spec.sparse) {
      const sparse = spec.sparse, Index = types[sparse.indices.componentType];
      if (![Uint8Array, Uint16Array, Uint32Array].includes(Index)) {
        throw new Error("Invalid sparse glTF indices");
      }
      const view = description.bufferViews[sparse.indices.bufferView];
      const offset = (view.byteOffset || 0) + (sparse.indices.byteOffset || 0);
      if (sparse.count > spec.count || (sparse.indices.byteOffset || 0) + sparse.count * Index.BYTES_PER_ELEMENT > view.byteLength) {
        throw new Error("Invalid sparse glTF indices");
      }
      const indices = new Index(description.buffers[view.buffer].binary.slice(offset, offset + sparse.count * Index.BYTES_PER_ELEMENT));
      read2(
        sparse.values.bufferView,
        sparse.values.byteOffset || 0,
        sparse.count,
        0,
        (i) => {
          if (indices[i] >= spec.count) throw new Error("Invalid sparse glTF index");
          return indices[i];
        }
      );
    }
    if (spec.componentType === 5126) {
      return { data, size };
    }
    const normalized = new Float32Array(data.length);
    for (let i = 0; i < data.length; i++) {
      normalized[i] = spec.normalized ? Math.max(-1, data[i] / (Type === Int8Array ? 127 : Type === Int16Array ? 32767 : Type === Uint8Array ? 255 : Type === Uint32Array ? 4294967295 : 65535)) : data[i];
    }
    return { data: normalized, size, indices: data };
  }
  function nodeMatrix(spec) {
    if (spec.matrix) return Array.from(spec.matrix);
    const [x, y, z, w] = spec.rotation || [0, 0, 0, 1], [sx, sy, sz] = spec.scale || [1, 1, 1];
    return [
      (1 - 2 * (y * y + z * z)) * sx,
      2 * (x * y + z * w) * sx,
      2 * (x * z - y * w) * sx,
      0,
      2 * (x * y - z * w) * sy,
      (1 - 2 * (x * x + z * z)) * sy,
      2 * (y * z + x * w) * sy,
      0,
      2 * (x * z + y * w) * sz,
      2 * (y * z - x * w) * sz,
      (1 - 2 * (x * x + y * y)) * sz,
      0,
      ...spec.translation || [0, 0, 0],
      1
    ];
  }
  function vertexNormals(p, indices) {
    const normals = new Float32Array(p.length);
    for (let i = 0; i < (indices?.length || p.length / 3); i += 3) {
      const a = indices ? indices[i] : i, b = indices ? indices[i + 1] : i + 1, c = indices ? indices[i + 2] : i + 2;
      const u = [0, 1, 2].map((j) => p[b * 3 + j] - p[a * 3 + j]), v = [0, 1, 2].map((j) => p[c * 3 + j] - p[a * 3 + j]);
      const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
      for (const index of [a, b, c]) {
        for (let j = 0; j < 3; j++) {
          normals[index * 3 + j] += n[j];
        }
      }
    }
    for (let i = 0; i < normals.length; i += 3) {
      const length = Math.hypot(...normals.subarray(i, i + 3)) || 1;
      for (let j = 0; j < 3; j++) {
        normals[i + j] /= length;
      }
    }
    return normals;
  }
  function textureSampler(sampler) {
    return {
      addressModeU: sampler.wrapS === 33071 ? "clamp-to-edge" : sampler.wrapS === 33648 ? "mirror-repeat" : "repeat",
      addressModeV: sampler.wrapT === 33071 ? "clamp-to-edge" : sampler.wrapT === 33648 ? "mirror-repeat" : "repeat",
      magFilter: sampler.magFilter === 9728 ? "nearest" : "linear",
      minFilter: sampler.minFilter === 9728 || sampler.minFilter === 9984 || sampler.minFilter === 9986 ? "nearest" : "linear"
    };
  }
  var types, sizes;
  var init_model = __esm({
    "src/utils/model.js"() {
      types = {
        5120: Int8Array,
        5121: Uint8Array,
        5122: Int16Array,
        5123: Uint16Array,
        5125: Uint32Array,
        5126: Float32Array
      };
      sizes = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };
    }
  });

  // src/scene/model.js
  async function loadModel(backend) {
    await backend._added.promise;
    const url = new URL(backend.modelUrl, document.baseURI).href;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Unable to load model: HTTP ${response.status}`);
    }
    const data = await response.arrayBuffer();
    const description = decodeModel(data);
    const directory = new URL(".", url).href;
    await Promise.all((description.buffers || []).map(async (buffer) => {
      if (buffer.binary) {
        return;
      }
      const response2 = await fetch(new URL(buffer.uri, directory).href);
      if (!response2.ok) {
        throw new Error(`Unable to load model buffer: HTTP ${response2.status}`);
      }
      buffer.binary = await response2.arrayBuffer();
    }));
    await backend._added.promise;
    const images = await Promise.all((description.images || []).map(async (image) => {
      let blob;
      if (image.bufferView !== void 0) {
        const view = description.bufferViews[image.bufferView];
        const buffer = description.buffers[view.buffer].binary;
        blob = new Blob(
          [buffer.slice(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength)],
          { type: image.mimeType }
        );
      } else {
        const response2 = await fetch(new URL(image.uri, directory).href);
        if (!response2.ok) throw new Error(`Unable to load model texture: HTTP ${response2.status}`);
        blob = await response2.blob();
      }
      return createImageBitmap(blob, { premultiplyAlpha: "none", colorSpaceConversion: "none" });
    }));
    const textures = /* @__PURE__ */ new Map();
    const textureFor = (reference, color = false) => {
      if (!reference) return null;
      if ((reference.texCoord || 0) !== 0 || reference.extensions) {
        throw new Error("Model textures currently require untransformed TEXCOORD_0 UVs");
      }
      const device = backend.renderer.device;
      const key = `${reference.index}:${color}`;
      if (!textures.has(key)) {
        const texture = description.textures[reference.index];
        const sampler = description.samplers?.[texture.sampler] || {};
        const image = images[texture.source];
        const format = color ? "rgba8unorm-srgb" : "rgba8unorm";
        const samplerOptions = textureSampler(sampler);
        textures.set(key, {
          device,
          texture: device.createTexture({
            size: [image.width, image.height],
            format,
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
          }),
          sampler: device.createSampler(samplerOptions),
          samplerOptions,
          format,
          srgb: color,
          image,
          flipY: false,
          uploaded: null
        });
      }
      return textures.get(key);
    };
    const materials = (description.materials || []).map((material) => {
      const pbr = material.pbrMetallicRoughness || {};
      return {
        color: (pbr.baseColorFactor || [1, 1, 1, 1]).slice(0, 3),
        opacity: pbr.baseColorFactor?.[3] ?? 1,
        metallic: pbr.metallicFactor ?? 1,
        roughness: pbr.roughnessFactor ?? 1,
        baseTexture: textureFor(pbr.baseColorTexture, true),
        metalTexture: textureFor(pbr.metallicRoughnessTexture),
        emissiveTexture: textureFor(material.emissiveTexture, true),
        occlusionTexture: textureFor(material.occlusionTexture),
        emissive: material.emissiveFactor || [0, 0, 0],
        occlusionStrength: material.occlusionTexture?.strength ?? 1,
        alphaMode: material.alphaMode || "OPAQUE",
        alphaCutoff: material.alphaCutoff ?? 0.5,
        doubleSided: material.doubleSided
      };
    });
    let nodes;
    {
      const active = /* @__PURE__ */ new Set(), resources = [];
      const node = (index) => {
        if (active.has(index)) throw new Error("Cyclic glTF nodes");
        const spec = description.nodes[index];
        if (!spec) throw new Error("Invalid glTF node");
        active.add(index);
        const group = {
          ...emptyNode(),
          name: spec.name
        };
        group.matrix = nodeMatrix(spec);
        if (spec.mesh !== void 0) {
          for (const primitive of description.meshes[spec.mesh].primitives) {
            const attributes = {};
            for (const [semantic, name] of [["POSITION", "position"], ["NORMAL", "normal"], ["TEXCOORD_0", "uv"]]) {
              if (primitive.attributes[semantic] !== void 0) attributes[name] = readAccessor(description, primitive.attributes[semantic]);
            }
            if (!attributes.position) throw new Error("glTF mesh has no positions");
            const vertexCount = attributes.position.data.length / 3;
            if (attributes.position.size !== 3 || vertexCount < 3 || Object.values(attributes).some((attribute) => attribute.data.length / attribute.size !== vertexCount)) throw new Error("Invalid glTF vertex attributes");
            if (primitive.indices !== void 0) {
              const index2 = readAccessor(description, primitive.indices);
              attributes.index = { size: 1, data: index2.indices };
              if (![Uint8Array, Uint16Array, Uint32Array].some((Type) => index2.indices instanceof Type) || index2.size !== 1 || index2.indices.length % 3 || [...index2.indices].some((i) => i >= vertexCount)) throw new Error("Invalid glTF triangle indices");
            }
            if (!attributes.index && vertexCount % 3) throw new Error("Incomplete glTF triangle");
            if (!attributes.normal) {
              const normals = vertexNormals(attributes.position.data, attributes.index?.data);
              attributes.normal = { size: 3, data: normals };
            }
            const style = materials[primitive.material] || { color: [1, 1, 1], metallic: 1 };
            if ([style.baseTexture, style.metalTexture, style.emissiveTexture, style.occlusionTexture].some(Boolean) && !attributes.uv) {
              throw new Error("Textured model mesh requires UV coordinates");
            }
            const program = backend._createProgram(style);
            resources.push(program);
            const device = backend.renderer.device;
            if (attributes.index?.data instanceof Uint8Array) {
              attributes.index.data = Uint16Array.from(attributes.index.data);
            }
            for (const [name, attribute] of Object.entries(attributes)) {
              attribute.size ||= 1;
              attribute.count = attribute.data.length / attribute.size;
              attribute.indexFormat = attribute.data instanceof Uint32Array ? "uint32" : "uint16";
              attribute.buffer = device.createBuffer({
                size: Math.max(4, attribute.data.byteLength),
                usage: name === "index" ? GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST : GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
              });
              device.queue.writeBuffer(attribute.buffer, 0, attribute.data);
            }
            const geometry = {
              device,
              attributes,
              drawRange: { start: 0, count: attributes.index?.count || attributes.position.count }
            };
            resources.push(geometry);
            const mesh = {
              ...emptyNode(),
              device,
              geometry,
              program,
              id: L.Layer.types["3d"]._nextId++,
              renderOrder: 0
            };
            mesh.name = description.meshes[spec.mesh].name;
            mesh.extras = spec.extras || {};
            setParent(mesh, group);
          }
        }
        for (const child of spec.children || []) setParent(node(child), group);
        active.delete(index);
        return group;
      };
      const scene = description.scenes?.[description.scene || 0];
      if (!scene) throw new Error("Missing glTF scene");
      try {
        nodes = scene.nodes.map(node);
      } catch (error) {
        for (const resource of resources) {
          if (resource.attributes) {
            for (const attribute of Object.values(resource.attributes)) attribute.buffer.destroy();
          } else backend._removeProgram(resource);
        }
        throw error;
      }
    }
    const model = {
      ...emptyNode(),
      id: url,
      extras: description.extras || {}
    };
    if (!nodes.length) throw new Error("Expected a glTF model with a non-empty scene");
    for (const node of nodes) setParent(node, model);
    backend.model = model;
    if (backend.options.rotation) {
      const [x, y = x, z = x] = backend.options.rotation;
      backend.model.rotation[0] = x;
      backend.model.rotation[1] = y;
      backend.model.rotation[2] = z;
    }
    if (backend.options.scale) {
      const [x, y = x, z = x] = backend.options.scale;
      backend.model.scale[0] = x;
      backend.model.scale[1] = y;
      backend.model.scale[2] = z;
    }
    setParent(backend.model, backend.root);
  }
  var init_model2 = __esm({
    "src/scene/model.js"() {
      init_model();
      init_scene();
    }
  });

  // src/utils/picking.js
  function intersectMeshes(ray, meshes, night = 0) {
    const hits = [], a = [0, 0, 0], b = [0, 0, 0], c = [0, 0, 0], sub = (a2, b2) => a2.map((v, i) => v - b2[i]), cross = (a2, b2) => [a2[1] * b2[2] - a2[2] * b2[1], a2[2] * b2[0] - a2[0] * b2[2], a2[0] * b2[1] - a2[1] * b2[0]], dot = (a2, b2) => a2.reduce((sum, v, i) => sum + v * b2[i], 0);
    for (const mesh of meshes) {
      const inverse = new DOMMatrix(mesh.worldMatrix).inverse();
      const inverseValues = inverse.toFloat64Array();
      if (![...inverseValues].every(Number.isFinite)) {
        throw new Error("Singular 3D transform");
      }
      const localOrigin = new DOMPoint(...ray.origin, 1).matrixTransform(inverse);
      const origin = [
        localOrigin.x / localOrigin.w,
        localOrigin.y / localOrigin.w,
        localOrigin.z / localOrigin.w
      ];
      const localDirection = new DOMPoint(...ray.direction, 0).matrixTransform(inverse);
      const direction = [
        localDirection.x,
        localDirection.y,
        localDirection.z
      ];
      const directionLength = Math.hypot(...direction) || 1;
      direction[0] /= directionLength;
      direction[1] /= directionLength;
      direction[2] /= directionLength;
      if (!mesh.geometry.bounds) {
        computeBounds(mesh.geometry);
      }
      let near = 0, far = Infinity;
      for (let i = 0; i < 3; i++) {
        if (Math.abs(direction[i]) < 1e-12) {
          if (origin[i] < mesh.geometry.bounds.min[i] || origin[i] > mesh.geometry.bounds.max[i]) {
            far = -Infinity;
            break;
          }
        } else {
          const a2 = (mesh.geometry.bounds.min[i] - origin[i]) / direction[i], b2 = (mesh.geometry.bounds.max[i] - origin[i]) / direction[i];
          near = Math.max(near, Math.min(a2, b2));
          far = Math.min(far, Math.max(a2, b2));
        }
      }
      if (far < near) {
        continue;
      }
      const { position, index } = mesh.geometry.attributes;
      let closest = Infinity, faceIndex;
      for (let i = 0; i < (index?.count || position.count); i += 3) {
        const ai = (index ? index.data[i] : i) * position.size;
        const bi = (index ? index.data[i + 1] : i + 1) * position.size;
        const ci = (index ? index.data[i + 2] : i + 2) * position.size;
        a[0] = position.data[ai];
        a[1] = position.data[ai + 1];
        a[2] = position.data[ai + 2];
        b[0] = position.data[bi];
        b[1] = position.data[bi + 1];
        b[2] = position.data[bi + 2];
        c[0] = position.data[ci];
        c[1] = position.data[ci + 1];
        c[2] = position.data[ci + 2];
        const e = sub(b, a), f = sub(c, a), p = cross(direction, f), det = dot(e, p);
        if (mesh.program.cullFace !== null ? det < 1e-9 : Math.abs(det) < 1e-9) {
          continue;
        }
        const t = sub(origin, a), u = dot(t, p) / det;
        if (u < 0 || u > 1) {
          continue;
        }
        const q = cross(t, e), v = dot(direction, q) / det;
        if (v < 0 || u + v > 1) {
          continue;
        }
        if (mesh.program.nightLight) {
          const uv = mesh.geometry.attributes.uv.data;
          const ids = index ? [index.data[i], index.data[i + 1], index.data[i + 2]] : [i, i + 1, i + 2];
          const x = uv[ids[0] * 2] * (1 - u - v) + uv[ids[1] * 2] * u + uv[ids[2] * 2] * v;
          const y = uv[ids[0] * 2 + 1] * (1 - u - v) + uv[ids[1] * 2 + 1] * u + uv[ids[2] * 2 + 1] * v;
          if (x <= 2 && (!night || x * x + y * y > 0.9)) continue;
        }
        const distance = dot(f, q) / det;
        if (distance > 0 && distance < closest) {
          closest = distance;
          faceIndex = i / 3;
        }
      }
      if (faceIndex === void 0) continue;
      const point = new DOMPoint(
        direction[0] * closest + origin[0],
        direction[1] * closest + origin[1],
        direction[2] * closest + origin[2],
        1
      ).matrixTransform(new DOMMatrix(mesh.worldMatrix));
      const worldPoint = [point.x / point.w, point.y / point.w, point.z / point.w];
      hits.push({
        faceIndex,
        object: mesh,
        point: worldPoint,
        distance: Math.hypot(
          worldPoint[0] - ray.origin[0],
          worldPoint[1] - ray.origin[1],
          worldPoint[2] - ray.origin[2]
        )
      });
    }
    return hits.sort((a2, b2) => a2.distance - b2.distance);
  }
  var init_picking = __esm({
    "src/utils/picking.js"() {
      init_geometry();
    }
  });

  // src/scene/picking.js
  function raycast(backend, event, objects = backend.root.children, recursive = true) {
    if (!backend.renderer) {
      return [];
    }
    const rect = backend._map.getContainer().getBoundingClientRect();
    updateWorldMatrix(backend.scene);
    updateCamera(backend.camera);
    const inverseCamera = new DOMMatrix(backend.camera.projectionViewMatrix).inverse();
    const inverseCameraValues = inverseCamera.toFloat64Array();
    if (![...inverseCameraValues].every(Number.isFinite)) {
      throw new Error("Singular 3D transform");
    }
    backend.raycaster.origin[0] = backend.camera.position[0];
    backend.raycaster.origin[1] = backend.camera.position[1];
    backend.raycaster.origin[2] = backend.camera.position[2];
    const unprojected = new DOMPoint(
      (event.clientX - rect.left) / rect.width * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
      0,
      1
    ).matrixTransform(inverseCamera);
    const end = [
      unprojected.x / unprojected.w,
      unprojected.y / unprojected.w,
      unprojected.z / unprojected.w
    ];
    backend.raycaster.direction[0] = end[0] - backend.raycaster.origin[0];
    backend.raycaster.direction[1] = end[1] - backend.raycaster.origin[1];
    backend.raycaster.direction[2] = end[2] - backend.raycaster.origin[2];
    const rayLength = Math.hypot(...backend.raycaster.direction) || 1;
    backend.raycaster.direction[0] /= rayLength;
    backend.raycaster.direction[1] /= rayLength;
    backend.raycaster.direction[2] /= rayLength;
    const meshes = [];
    for (const object of objects) {
      if (recursive) traverse(object, (mesh) => {
        if (mesh.geometry && mesh.visible) meshes.push(mesh);
      });
      else if (object.geometry && object.visible) meshes.push(object);
    }
    return intersectMeshes(backend.raycaster, meshes, backend.renderer.uniformData?.[55]);
  }
  function findFeature(backend, event) {
    if (!backend.root || !backend.camera) return null;
    for (const hit2 of backend.raycast(event, backend.root.children, Boolean(backend.model))) {
      if (backend.model) {
        let object = hit2.object;
        while (object && object !== backend.model) object = object.parent;
        if (object === backend.model) {
          return {
            id: backend.model.id,
            properties: backend.model.extras,
            model: backend.model,
            mesh: hit2.object,
            point: hit2.point
          };
        }
      }
      const ranges = hit2.object.extras?.featureFaces;
      if (!ranges) continue;
      let low = 0, high = ranges.length - 1;
      while (low <= high) {
        const middle = low + high >> 1;
        const range = ranges[middle];
        if (hit2.faceIndex < range.faceStart) high = middle - 1;
        else if (hit2.faceIndex >= range.faceEnd) low = middle + 1;
        else return { ...range, mesh: hit2.object, point: hit2.point };
      }
    }
    return null;
  }
  function setHighlight(backend, feature) {
    if (feature?.model) feature = null;
    if (backend.highlightedFeature?.mesh === feature?.mesh && backend.highlightedFeature?.vertexStart === feature?.vertexStart) return;
    if (backend.highlightedFeature) backend.highlightedFeature.mesh.highlight = null;
    backend.highlightedFeature = feature;
    if (feature) feature.mesh.highlight = [feature.vertexStart, feature.vertexEnd];
    backend.update();
  }
  function showFeature(backend, feature, event) {
    const tooltip2 = backend._tooltip;
    if (!tooltip2) return;
    if (feature) {
      tooltip2.replaceChildren(backend.options.tooltipContent(feature));
      tooltip2.hidden = false;
      const rect = backend.container.getBoundingClientRect();
      const x = event.clientX - rect.left, y = event.clientY - rect.top;
      tooltip2.style.left = `${x + tooltip2.offsetWidth + 16 > rect.width ? x - tooltip2.offsetWidth - 12 : x + 12}px`;
      tooltip2.style.top = `${y + tooltip2.offsetHeight + 16 > rect.height ? y - tooltip2.offsetHeight - 12 : y + 12}px`;
    } else {
      tooltip2.hidden = true;
    }
    const shared = backend._shared;
    if (shared) {
      const visible = [...shared._layers].some((layer) => layer._tooltip && !layer._tooltip.hidden);
      if (visible) {
        if (shared._cursor === void 0) shared._cursor = backend.container.style.cursor;
        backend.container.style.cursor = "pointer";
      } else if (shared._cursor !== void 0) {
        backend.container.style.cursor = shared._cursor;
        delete shared._cursor;
      }
    }
  }
  function onPointerMove(backend, event) {
    backend.hoveredFeature = backend._findFeature(event);
    backend._setHighlight(backend.hoveredFeature);
    backend._showFeature(backend.hoveredFeature, event);
    backend.fire("featurehover", { feature: backend.hoveredFeature, originalEvent: event });
  }
  function onClick(backend, event) {
    const feature = backend._findFeature(event);
    backend.hoveredFeature = feature;
    backend._setHighlight(feature);
    backend._showFeature(feature, event);
    backend.fire("featureclick", { feature, originalEvent: event });
  }
  function onPointerLeave(backend) {
    backend.hoveredFeature = null;
    backend._setHighlight(null);
    backend._showFeature(null);
    backend.fire("featurehover", { feature: null });
  }
  var init_picking2 = __esm({
    "src/scene/picking.js"() {
      init_picking();
      init_scene();
    }
  });

  // src/utils/pmtiles.js
  async function decompress(data, compression) {
    if (compression === 1) return data;
    if (compression !== 2) throw new Error(`Unsupported PMTiles compression: ${compression}`);
    return new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer();
  }
  function decodeHeader(data) {
    const view = new DataView(data);
    const header = {};
    ["rootDirectoryOffset", "rootDirectoryLength", "jsonMetadataOffset", "jsonMetadataLength", "leafDirectoryOffset", "leafDirectoryLength", "tileDataOffset", "tileDataLength", "numAddressedTiles", "numTileEntries", "numTileContents"].forEach((name, i) => {
      header[name] = Number(view.getBigUint64(8 + i * 8, true));
    });
    ["clustered", "internalCompression", "tileCompression", "tileType", "minZoom", "maxZoom"].forEach((name, i) => {
      header[name] = view.getUint8(96 + i);
    });
    ["minLon", "minLat", "maxLon", "maxLat"].forEach((name, i) => {
      header[name] = view.getInt32(102 + i * 4, true) / 1e7;
    });
    header.centerZoom = view.getUint8(118);
    header.centerLon = view.getInt32(119, true) / 1e7;
    header.centerLat = view.getInt32(123, true) / 1e7;
    return header;
  }
  function tileId(z, x, y) {
    if (![z, x, y].every(Number.isInteger) || z < 0 || z > 26 || x < 0 || y < 0 || x >= 2 ** z || y >= 2 ** z) throw new Error("Invalid PMTiles tile coordinates");
    let id = (4 ** z - 1) / 3;
    const n = 2 ** z;
    for (let s = n / 2; s >= 1; s /= 2) {
      const rx = x & s ? 1 : 0, ry = y & s ? 1 : 0;
      id += s * s * (3 * rx ^ ry);
      if (!ry) {
        if (rx) {
          x = n - 1 - x;
          y = n - 1 - y;
        }
        [x, y] = [y, x];
      }
    }
    return id;
  }
  function decodeDirectory(data) {
    const bytes = new Uint8Array(data);
    let cursor = 0;
    const varint = () => {
      let value = 0;
      for (let factor = 1; factor <= 2 ** 49; factor *= 128) {
        if (cursor >= bytes.length) throw new Error("Truncated PMTiles directory");
        const byte = bytes[cursor++];
        value += (byte & 127) * factor;
        if (!Number.isSafeInteger(value)) throw new Error("Invalid PMTiles directory integer");
        if (byte < 128) return value;
      }
      throw new Error("Invalid PMTiles directory integer");
    };
    const count = varint();
    if (count > (bytes.length - cursor) / 4) throw new Error("Invalid PMTiles directory count");
    const entries = [];
    let tileId2 = 0;
    for (let i = 0; i < count; i++) {
      tileId2 += varint();
      if (!Number.isSafeInteger(tileId2) || i && tileId2 <= entries[i - 1].tileId) {
        throw new Error("Invalid PMTiles directory tile IDs");
      }
      entries.push({ tileId: tileId2 });
    }
    for (const entry of entries) entry.runLength = varint();
    for (const entry of entries) {
      entry.length = varint();
      if (!entry.length) throw new Error("Invalid PMTiles directory length");
    }
    entries.forEach((entry, i) => {
      const value = varint();
      if (!value && !i) throw new Error("Invalid PMTiles directory offset");
      entry.offset = value ? value - 1 : entries[i - 1].offset + entries[i - 1].length;
    });
    if (cursor !== bytes.length) throw new Error("Trailing PMTiles directory data");
    return entries;
  }
  var init_pmtiles = __esm({
    "src/utils/pmtiles.js"() {
    }
  });

  // src/scene/pmtiles.js
  async function read(backend, offset, length, signal) {
    signal?.throwIfAborted();
    if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(length) || offset < 0 || length <= 0 || !Number.isSafeInteger(offset + length)) {
      throw new Error("Invalid PMTiles byte range");
    }
    const response = await fetch(backend.url, {
      headers: { Range: `bytes=${offset}-${offset + length - 1}` },
      signal
    });
    if (!response.ok) throw new Error(`Unable to read PMTiles: HTTP ${response.status}`);
    const etag = response.headers.get("ETag");
    if (backend._etag && etag !== backend._etag) {
      throw new Error("PMTiles archive changed; recreate the layer");
    }
    if (etag) {
      backend._etag = etag;
    }
    let data = await response.arrayBuffer();
    if (response.status === 200) {
      data = data.slice(offset, offset + length);
    } else if (response.status !== 206 || !response.headers.get("Content-Range")?.startsWith(`bytes ${offset}-${offset + length - 1}/`)) {
      throw new Error("Invalid PMTiles range response");
    }
    if (data.byteLength !== length) {
      throw new Error("Truncated PMTiles range");
    }
    return data;
  }
  function getHeader(backend) {
    return backend._header ||= backend._read(0, 127).then(decodeHeader);
  }
  async function getZxy(backend, z, x, y, signal) {
    const id = tileId(z, x, y);
    signal?.throwIfAborted();
    const header = await backend.getHeader();
    signal?.throwIfAborted();
    if (z < header.minZoom || z > header.maxZoom) return;
    let offset = header.rootDirectoryOffset, length = header.rootDirectoryLength;
    const visited = /* @__PURE__ */ new Set();
    for (let depth = 0; depth < 4; depth++) {
      if (visited.has(offset)) {
        throw new Error("Cyclic PMTiles directory");
      }
      visited.add(offset);
      const key = `${offset}:${length}`;
      if (!backend._directories.has(key)) {
        if (backend._directories.size >= 32) {
          backend._directories.delete(backend._directories.keys().next().value);
        }
        const pending = backend._read(offset, length).then((data) => decompress(data, header.internalCompression)).then(decodeDirectory).catch((error) => {
          if (backend._directories.get(key) === pending) backend._directories.delete(key);
          throw error;
        });
        backend._directories.set(key, pending);
      }
      const entries = await backend._directories.get(key);
      signal?.throwIfAborted();
      let low = 0, high = entries.length - 1;
      while (low <= high) {
        const mid = low + high >> 1;
        if (entries[mid].tileId <= id) low = mid + 1;
        else high = mid - 1;
      }
      const entry = entries[high];
      if (!entry) return;
      if (entry.runLength) {
        if (id - entry.tileId >= entry.runLength) return;
        if (entry.offset + entry.length > header.tileDataLength) throw new Error("PMTiles tile outside data section");
        const data = await decompress(await backend._read(header.tileDataOffset + entry.offset, entry.length, signal), header.tileCompression);
        signal?.throwIfAborted();
        return { data };
      }
      if (entry.offset + entry.length > header.leafDirectoryLength) throw new Error("PMTiles directory outside leaf section");
      offset = header.leafDirectoryOffset + entry.offset;
      length = entry.length;
    }
    throw new Error("PMTiles directory depth exceeds four levels");
  }
  var init_pmtiles2 = __esm({
    "src/scene/pmtiles.js"() {
      init_pmtiles();
    }
  });

  // src/scene/render.js
  function update(backend) {
    const shared = backend._shared;
    if (!shared) return backend;
    if (shared !== backend) {
      shared.update();
      return backend;
    }
    backend._frame ||= requestAnimationFrame(() => {
      backend._frame = null;
      if (backend._shared === backend && backend.renderer) backend._render();
    });
    return backend;
  }
  function onMapChange(backend) {
    if (backend._queued) return;
    backend._queued = true;
    queueMicrotask(() => {
      backend._queued = false;
      if (backend._shared !== backend || !backend.renderer) return;
      if (backend._map._animatingZoom) backend.update();
      else backend._render();
    });
  }
  function getTileLevel(backend) {
    let level;
    backend._map.eachLayer((layer) => {
      if (!level && layer instanceof L.TileLayer && layer._levels) {
        level = layer._levels[layer._tileZoom];
      }
    });
    return level;
  }
  function startZoom(backend) {
    backend._zoomLevel = backend._getTileLevel();
  }
  function endZoom(backend) {
    for (const animation of backend._zoomTransitions?.keys() || []) animation.finish();
    backend._zoomTransitions = null;
    backend._zoomLevel = null;
    backend.update();
  }
  function render(backend) {
    cancelAnimationFrame(backend._frame);
    backend._frame = null;
    if (backend._shared !== backend || !backend.renderer) return;
    const map = backend._map;
    const size = map.getSize();
    if (!size.x || !size.y) return;
    if (map._animatingZoom) {
      backend._zoomTransitions ||= /* @__PURE__ */ new Map();
      const now = performance.now();
      for (const animation of map.getContainer().getAnimations({ subtree: true })) {
        if (!(animation instanceof CSSTransition) || animation.transitionProperty !== "transform" || !animation.effect.target.classList.contains("leaflet-zoom-animated") || backend._zoomTransitions.has(animation)) {
          continue;
        }
        const time = animation.currentTime || 0;
        animation.pause();
        backend._zoomTransitions.set(animation, { start: now, time });
      }
      for (const [animation, { start, time }] of backend._zoomTransitions) {
        animation.currentTime = Math.min(animation.effect.getComputedTiming().endTime, time + now - start);
      }
    }
    if (!backend._size || !backend._size.equals(size)) {
      backend.renderer.width = size.x;
      backend.renderer.height = size.y;
      backend.renderer.canvas.width = Math.round(size.x * backend.renderer.dpr);
      backend.renderer.canvas.height = Math.round(size.y * backend.renderer.dpr);
      backend.renderer.canvas.style.width = `${size.x}px`;
      backend.renderer.canvas.style.height = `${size.y}px`;
      if (backend.renderer.depthTexture) backend._destroyTexture(backend.renderer.depthTexture);
      backend.renderer.depthTexture = backend.renderer.device.createTexture({
        size: [backend.renderer.canvas.width, backend.renderer.canvas.height],
        format: "depth24plus",
        usage: GPUTextureUsage.RENDER_ATTACHMENT
      });
      backend._size = size;
    }
    let pixelsPerMeter = map.options.crs.scale(map.getZoom()) / (4007501668557849e-8 * Math.cos(backend._sceneOrigin.lat * Math.PI / 180));
    let origin = map.project(backend._sceneOrigin).subtract(map.getPixelOrigin());
    const level = backend._zoomLevel?.el.isConnected ? backend._zoomLevel : backend._getTileLevel();
    if (level && map._animatingZoom) {
      backend._zoomLevel = level;
    }
    if (level) {
      const transform = new DOMMatrix(map._animatingZoom ? getComputedStyle(level.el).transform : level.el.style.transform);
      const point = map.project(backend._sceneOrigin, level.zoom).subtract(level.origin);
      origin = new L.Point(point.x * transform.a + transform.e, point.y * transform.d + transform.f);
      pixelsPerMeter *= map.getZoomScale(level.zoom, map.getZoom()) * transform.a;
    }
    const distance = size.y * 1.5 / pixelsPerMeter;
    const center = map.containerPointToLayerPoint(size.divideBy(2));
    const target = [
      (center.x - origin.x) / pixelsPerMeter,
      map._terrain3D?._getElevation(map.getCenter()) ?? 0,
      (center.y - origin.y) / pixelsPerMeter
    ];
    const pitch = map.getPitch() * Math.PI / 180;
    const bearing = map.getBearing() * Math.PI / 180;
    const camera = backend.camera;
    camera.fov = 2 * Math.atan(1 / 3) * 180 / Math.PI;
    camera.aspect = size.x / size.y;
    camera.near = Math.max(0.1, distance / 1e4);
    camera.far = Math.max(1e4, distance * 10);
    camera.position[0] = target[0] + Math.sin(bearing) * Math.sin(pitch) * distance;
    camera.position[1] = target[1] + Math.cos(pitch) * distance;
    camera.position[2] = target[2] + Math.cos(bearing) * Math.sin(pitch) * distance;
    camera.up[0] = -Math.sin(bearing) * Math.cos(pitch);
    camera.up[1] = Math.sin(pitch);
    camera.up[2] = -Math.cos(bearing) * Math.cos(pitch);
    camera.target[0] = target[0];
    camera.target[1] = target[1];
    camera.target[2] = target[2];
    updateCamera(camera);
    const sunlight = map._sunlight;
    const lightPoint = new DOMPoint(...sunlight?.direction || [-300, 500, 300], 0).matrixTransform(new DOMMatrix(camera.viewMatrix));
    const lightLength = Math.hypot(lightPoint.x, lightPoint.y, lightPoint.z) || 1;
    const light = [lightPoint.x / lightLength, lightPoint.y / lightLength, lightPoint.z / lightLength];
    const skyPoint = new DOMPoint(0, 1, 0, 0).matrixTransform(new DOMMatrix(camera.viewMatrix));
    const skyLength = Math.hypot(skyPoint.x, skyPoint.y, skyPoint.z) || 1;
    const sky = [skyPoint.x / skyLength, skyPoint.y / skyLength, skyPoint.z / skyLength];
    const projection = camera.projectionViewMatrix;
    const frustum = [
      [projection[3] + projection[0], projection[7] + projection[4], projection[11] + projection[8], projection[15] + projection[12]],
      [projection[3] - projection[0], projection[7] - projection[4], projection[11] - projection[8], projection[15] - projection[12]],
      [projection[3] + projection[1], projection[7] + projection[5], projection[11] + projection[9], projection[15] + projection[13]],
      [projection[3] - projection[1], projection[7] - projection[5], projection[11] - projection[9], projection[15] - projection[13]],
      [projection[2], projection[6], projection[10], projection[14]],
      [projection[3] - projection[2], projection[7] - projection[6], projection[11] - projection[10], projection[15] - projection[14]]
    ];
    const frustumLengths = [
      Math.hypot(frustum[0][0], frustum[0][1], frustum[0][2]),
      Math.hypot(frustum[1][0], frustum[1][1], frustum[1][2]),
      Math.hypot(frustum[2][0], frustum[2][1], frustum[2][2]),
      Math.hypot(frustum[3][0], frustum[3][1], frustum[3][2]),
      Math.hypot(frustum[4][0], frustum[4][1], frustum[4][2]),
      Math.hypot(frustum[5][0], frustum[5][1], frustum[5][2])
    ];
    updateWorldMatrix(backend.scene);
    traverse(backend.scene, (mesh) => {
      if (!mesh.visible) return true;
      if (mesh.geometry) {
        if (!mesh.geometry.bounds) computeBounds(mesh.geometry);
        const bounds = mesh.geometry.bounds;
        const world = mesh.worldMatrix;
        const center2 = bounds.center;
        const x = world[0] * center2[0] + world[4] * center2[1] + world[8] * center2[2] + world[12];
        const y = world[1] * center2[0] + world[5] * center2[1] + world[9] * center2[2] + world[13];
        const z = world[2] * center2[0] + world[6] * center2[1] + world[10] * center2[2] + world[14];
        const radius = bounds.radius * Math.max(
          Math.hypot(world[0], world[1], world[2]),
          Math.hypot(world[4], world[5], world[6]),
          Math.hypot(world[8], world[9], world[10])
        );
        mesh._visibleInFrame = frustum[0][0] * x + frustum[0][1] * y + frustum[0][2] * z + frustum[0][3] >= -radius * frustumLengths[0] && frustum[1][0] * x + frustum[1][1] * y + frustum[1][2] * z + frustum[1][3] >= -radius * frustumLengths[1] && frustum[2][0] * x + frustum[2][1] * y + frustum[2][2] * z + frustum[2][3] >= -radius * frustumLengths[2] && frustum[3][0] * x + frustum[3][1] * y + frustum[3][2] * z + frustum[3][3] >= -radius * frustumLengths[3] && frustum[4][0] * x + frustum[4][1] * y + frustum[4][2] * z + frustum[4][3] >= -radius * frustumLengths[4] && frustum[5][0] * x + frustum[5][1] * y + frustum[5][2] * z + frustum[5][3] >= -radius * frustumLengths[5];
        if (!mesh._visibleInFrame) return;
      }
      if (mesh.program?.transparent) {
        if (!mesh.geometry.bounds) computeBounds(mesh.geometry);
        const center2 = mesh.geometry.bounds.center, world = mesh.worldMatrix;
        const x = world[0] * center2[0] + world[4] * center2[1] + world[8] * center2[2] + world[12];
        const y = world[1] * center2[0] + world[5] * center2[1] + world[9] * center2[2] + world[13];
        const z = world[2] * center2[0] + world[6] * center2[1] + world[10] * center2[2] + world[14];
        const projection2 = camera.projectionViewMatrix;
        const clipZ = projection2[2] * x + projection2[6] * y + projection2[10] * z + projection2[14];
        const clipW = projection2[3] * x + projection2[7] * y + projection2[11] * z + projection2[15];
        mesh._sortDepth = clipZ / clipW;
      }
    });
    const renderer = backend.renderer;
    if ([...backend._layers].some((layer) => layer.options.roofTexture)) {
      const rasters = Object.values(map._layers).filter((layer) => layer instanceof L.Layer.types.pmtiles && layer._tiles && layer.options.opacity > 0);
      const tiles = rasters.flatMap((layer) => Object.values(layer._tiles).filter((tile) => tile.el.done && !tile.el.request.signal.aborted && tile.el.isConnected).map((tile) => ({ ...tile, layer })));
      const signature = tiles.map(({ el, coords, layer }) => `${L.Util.stamp(el)}:${coords.z}:${coords.x}:${coords.y}:${layer.options.opacity}:${layer.options.zIndex}`).join("|");
      const selection = rasters.map((layer) => `${L.Util.stamp(layer)}:${layer.options.opacity}:${layer.options.zIndex}`).join("|");
      if (!backend._roofRaster || backend._roofRaster.selection !== selection || !rasters.some((layer) => layer.isLoading()) && backend._roofRaster.signature !== signature) {
        const zoom = tiles.length ? Math.max(...tiles.map((tile) => tile.coords.z)) : map.getZoom();
        const bounds = new L.Bounds();
        for (const { coords, layer } of tiles) {
          const size3 = layer.getTileSize().multiplyBy(map.getZoomScale(zoom, coords.z));
          bounds.extend(new L.Point(coords.x, coords.y).scaleBy(size3));
          bounds.extend(new L.Point(coords.x + 1, coords.y + 1).scaleBy(size3));
        }
        const min = bounds.min || map.project(backend._sceneOrigin, zoom);
        const size2 = bounds.isValid() ? bounds.getSize() : new L.Point(1, 1);
        const limit = 4096;
        const scale = Math.min(1, limit / Math.max(size2.x, size2.y));
        const width = Math.max(1, Math.ceil(size2.x * scale));
        const height = Math.max(1, Math.ceil(size2.y * scale));
        const origin2 = map.project(backend._sceneOrigin, zoom);
        const pixels = map.options.crs.scale(zoom) / (4007501668557849e-8 * Math.cos(backend._sceneOrigin.lat * Math.PI / 180));
        const matrix = new DOMMatrix();
        matrix.m11 = pixels / size2.x;
        matrix.m33 = pixels / size2.y;
        matrix.m41 = (origin2.x - min.x) / size2.x;
        matrix.m43 = (origin2.y - min.y) / size2.y;
        const texture = backend._roofRaster?.texture;
        if (texture && (texture.width !== width || texture.height !== height)) {
          backend._destroyTexture(texture.texture);
          texture.texture = renderer.device.createTexture({
            size: [width, height],
            format: "rgba8unorm",
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
          });
          texture.width = width;
          texture.height = height;
        }
        backend._roofRaster = {
          signature,
          selection,
          matrix: Array.from(matrix.toFloat64Array()),
          texture: texture || {
            device: renderer.device,
            texture: renderer.device.createTexture({
              size: [width, height],
              format: "rgba8unorm",
              usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
            }),
            sampler: renderer.device.createSampler({
              addressModeU: "clamp-to-edge",
              addressModeV: "clamp-to-edge"
            }),
            samplerOptions: { addressModeU: "clamp-to-edge", addressModeV: "clamp-to-edge" },
            image: null,
            width,
            height,
            format: "rgba8unorm",
            srgb: false,
            flipY: false,
            uploaded: null
          }
        };
        const device = renderer.device;
        if (!renderer.roofBlit) {
          const module = device.createShaderModule({ code: `
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
        ` });
          renderer.roofBlit = {
            pipeline: device.createRenderPipeline({
              layout: "auto",
              vertex: { module, entryPoint: "vertexMain" },
              fragment: {
                module,
                entryPoint: "fragmentMain",
                targets: [{
                  format: "rgba8unorm",
                  blend: {
                    color: { srcFactor: "src-alpha", dstFactor: "one-minus-src-alpha", operation: "add" },
                    alpha: { srcFactor: "one", dstFactor: "one-minus-src-alpha", operation: "add" }
                  }
                }]
              },
              primitive: { topology: "triangle-strip" }
            }),
            sampler: device.createSampler({ magFilter: "linear", minFilter: "linear" })
          };
        }
        const roofTiles = backend._roofTiles ||= /* @__PURE__ */ new Map();
        for (const [el, source] of roofTiles) {
          if (!tiles.some((tile) => tile.el === el) || map._terrain3D?._rasterTiles.has(el)) {
            source.texture.destroy();
            roofTiles.delete(el);
          }
        }
        const opacities = new Float32Array(Math.max(1, tiles.length) * 64);
        const opacityBuffer = device.createBuffer({
          size: opacities.byteLength,
          usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
        const encoder2 = device.createCommandEncoder();
        const atlasPass = encoder2.beginRenderPass({
          colorAttachments: [{
            view: backend._roofRaster.texture.texture.createView(),
            clearValue: { r: 0, g: 0, b: 0, a: 0 },
            loadOp: "clear",
            storeOp: "store"
          }]
        });
        atlasPass.setPipeline(renderer.roofBlit.pipeline);
        tiles.sort((a, b) => (a.layer.options.zIndex || 0) - (b.layer.options.zIndex || 0) || a.coords.z - b.coords.z);
        for (const [i, { coords, el, layer }] of tiles.entries()) {
          let source = map._terrain3D?._rasterTiles.get(el)?.texture || roofTiles.get(el);
          if (!source) {
            source = {
              texture: device.createTexture({
                size: [el.naturalWidth, el.naturalHeight],
                format: "rgba8unorm",
                usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
              }),
              image: el,
              uploaded: null
            };
            roofTiles.set(el, source);
          }
          if (source.uploaded !== source.image) {
            device.queue.copyExternalImageToTexture(
              { source: el },
              { texture: source.texture },
              [source.texture.width, source.texture.height]
            );
            source.uploaded = source.image;
          }
          opacities[i * 64] = layer.options.opacity;
          const tileSize = layer.getTileSize().multiplyBy(map.getZoomScale(zoom, coords.z));
          const offset = new L.Point(coords.x, coords.y).scaleBy(tileSize).subtract(min);
          const x = offset.x * width / size2.x, y = offset.y * height / size2.y;
          atlasPass.setViewport(
            x,
            y,
            Math.min(tileSize.x * width / size2.x, width - x),
            Math.min(tileSize.y * height / size2.y, height - y),
            0,
            1
          );
          atlasPass.setBindGroup(0, device.createBindGroup({
            layout: renderer.roofBlit.pipeline.getBindGroupLayout(0),
            entries: [
              { binding: 0, resource: source.texture.createView() },
              { binding: 1, resource: renderer.roofBlit.sampler },
              { binding: 2, resource: { buffer: opacityBuffer, offset: i * 256, size: 4 } }
            ]
          }));
          atlasPass.draw(4);
        }
        atlasPass.end();
        device.queue.writeBuffer(opacityBuffer, 0, opacities);
        device.queue.submit([encoder2.finish()]);
        opacityBuffer.destroy();
      }
    } else if (backend._roofRaster) {
      backend._destroyTexture(backend._roofRaster.texture.texture);
      backend._roofRaster = null;
      for (const source of backend._roofTiles?.values() || []) source.texture.destroy();
      backend._roofTiles = null;
    }
    const meshes = [];
    traverse(backend.scene, (mesh) => {
      if (!mesh.visible) return true;
      if (mesh.geometry && mesh._visibleInFrame) meshes.push(mesh);
    });
    meshes.sort(
      (a, b) => Number(a.program.transparent) - Number(b.program.transparent) || (a.program.transparent ? (a.renderOrder || 0) - (b.renderOrder || 0) || b._sortDepth - a._sortDepth || a.id - b.id : a.id - b.id)
    );
    const encoder = renderer.device.createCommandEncoder();
    const pendingRasterTiles = [];
    const shadowMeshes = [];
    if (sunlight?.altitude >= 3) {
      for (const layer of backend._layers) {
        if (layer instanceof L.Layer.types.terrain) continue;
        traverse(layer.root, (mesh) => {
          if (!mesh.visible) return true;
          if (mesh.geometry && !mesh.tile && !mesh.program.nightLight && mesh.program.depthTest !== false) shadowMeshes.push(mesh);
        });
      }
    }
    if (!renderer.uniformBuffer || renderer.uniformBuffer.size < (meshes.length * 2 + shadowMeshes.length + 1) * 256) {
      if (renderer.uniformBuffer) backend._destroyTexture(renderer.uniformBuffer);
      renderer.uniformBuffer = renderer.device.createBuffer({
        size: Math.max(64, meshes.length * 4 + shadowMeshes.length * 2) * 256,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
      });
      renderer.uniformData = new Float32Array(renderer.uniformBuffer.size / 4);
    }
    const frameData = renderer.uniformData;
    frameData.set(camera.viewMatrix, 0);
    frameData.set(camera.projectionMatrix, 16);
    frameData.set(backend._roofRaster?.matrix || [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], 32);
    frameData.set(light, 48);
    frameData[51] = sunlight && sunlight.altitude <= 0 ? 0 : 1;
    frameData.set(sky, 52);
    const night = sunlight ? Math.max(0, Math.min(1, (3 - sunlight.altitude) / 9)) : 0;
    frameData[55] = night * night * (3 - 2 * night);
    frameData.set(sunlight?.tint || [1, 1, 1], 56);
    frameData[59] = 0;
    if (night > 0) backend._updatePointLights();
    renderer.uniformSlot = 1;
    backend._renderSunlight(encoder, shadowMeshes, sunlight);
    const pass = encoder.beginRenderPass({
      colorAttachments: [{
        view: renderer.context.getCurrentTexture().createView(),
        clearValue: { r: 0, g: 0, b: 0, a: 0 },
        loadOp: "clear",
        storeOp: "store"
      }],
      depthStencilAttachment: {
        view: renderer.depthTexture.createView(),
        depthClearValue: 1,
        depthLoadOp: "clear",
        depthStoreOp: "store"
      }
    });
    pass.setViewport(0, 0, renderer.canvas.width, renderer.canvas.height, 0, 1);
    pass.setBindGroup(1, renderer.sunlight.bindGroup);
    for (const mesh of meshes) {
      if (mesh.tile && mesh.tile.style.visibility !== "hidden") pendingRasterTiles.push(mesh.tile);
      const world = mesh.worldMatrix;
      if (mesh.texture) {
        mesh.program.uniforms.baseTexture.value = mesh.texture;
        mesh.program.uniforms.opacity.value = mesh.opacity;
      }
      const uniforms = mesh.program.uniforms;
      if (uniforms.roofTexture) uniforms.roofTexture.value = backend._roofRaster?.texture || renderer.roofFallbackTexture;
      const determinant = world[0] * (world[5] * world[10] - world[6] * world[9]) - world[4] * (world[1] * world[10] - world[2] * world[9]) + world[8] * (world[1] * world[6] - world[2] * world[5]);
      if (!Number.isFinite(determinant) || determinant === 0) {
        throw new Error("Singular 3D transform");
      }
      const frontFace = determinant < 0 ? "cw" : "ccw";
      const program = mesh.program;
      if (program.transparent && program._layerMaterial.doubleSided) {
        backend._drawGeometry(mesh, pass, "front", frontFace);
        backend._drawGeometry(mesh, pass, "back", frontFace);
      } else {
        backend._drawGeometry(mesh, pass, program.cullMode, frontFace);
      }
    }
    pass.end();
    renderer.device.queue.writeBuffer(renderer.uniformBuffer, 0, renderer.uniformData, 0, renderer.uniformSlot * 64);
    renderer.device.queue.submit([encoder.finish()]);
    if (pendingRasterTiles.length) {
      renderer.device.queue.onSubmittedWorkDone().then(() => {
        for (const tile of pendingRasterTiles) {
          if (tile.isConnected && tile._terrainVisibility !== void 0) tile.style.visibility = "hidden";
        }
      }, (error) => {
        for (const layer of backend._layers || []) layer.fire("error", { error });
      });
    }
    if (map._animatingZoom) backend.update();
  }
  var init_render = __esm({
    "src/scene/render.js"() {
      init_geometry();
      init_scene();
    }
  });

  // src/scene/sources.js
  function onTerrainChange(backend) {
    if (!backend._map) return;
    for (const area of backend._areas.values()) backend._releaseArea(area);
    backend._areas.clear();
    backend._updateArea();
  }
  function updateArea(backend) {
    if (!backend._map || !backend.header) return;
    const z = backend.header.minZoom;
    const center = backend._map.project(backend._map.getCenter(), z).divideBy(256).floor();
    const bounds = backend._map.getBounds();
    const nw = backend._map.project(bounds.getNorthWest(), z).divideBy(256).floor();
    const se = backend._map.project(bounds.getSouthEast(), z).divideBy(256).floor();
    const archiveNW = backend._map.project([backend.header.maxLat, backend.header.minLon], z).divideBy(256).floor();
    const archiveSE = backend._map.project([backend.header.minLat, backend.header.maxLon], z).divideBy(256).floor();
    const wanted = /* @__PURE__ */ new Map();
    for (let x = Math.max(0, nw.x - 1, archiveNW.x); x <= Math.min(2 ** z - 1, se.x + 1, archiveSE.x); x++) {
      for (let y = Math.max(0, nw.y - 1, archiveNW.y); y <= Math.min(2 ** z - 1, se.y + 1, archiveSE.y); y++) {
        wanted.set(`${x}/${y}`, { z, x, y });
      }
    }
    for (const [key, area] of backend._areas) {
      if (!wanted.has(key)) {
        backend._releaseArea(area);
        backend._areas.delete(key);
      }
    }
    for (const [key, coords] of [...wanted].sort(([, a], [, b]) => Math.hypot(a.x - center.x, a.y - center.y) - Math.hypot(b.x - center.x, b.y - center.y))) {
      if (!backend._areas.has(key)) backend._areas.set(key, { coords, request: new AbortController() });
    }
    backend._pump();
  }
  function pump(backend) {
    if (!backend._map || !backend._shared) return;
    for (const area of backend._areas.values()) {
      if (backend._inflight >= 2) break;
      if (area.started) continue;
      area.started = true;
      backend._inflight++;
      (async () => {
        try {
          const coords = area.coords, { z, x, y } = coords;
          const result = await backend.getZxy(z, x, y, area.request.signal);
          if (area.request.signal.aborted) return;
          const data = result ? JSON.parse(new TextDecoder().decode(result.data)) : { type: "FeatureCollection", features: [] };
          if (data.type !== "FeatureCollection" || !Array.isArray(data.features)) {
            throw new Error("Invalid GeoJSON response");
          }
          const features = data.features;
          const positions = [], normals = [], colors = [], uvs = [], featureFaces = [], lights = [];
          const supports = /* @__PURE__ */ new Set();
          let skipped = 0;
          const map = backend._map;
          const crs = map.options.crs;
          const origin = crs.project(backend.location);
          const metres = Math.cos(backend.location.lat * Math.PI / 180);
          const groundOffset = (point) => point.ground || 0;
          const addTriangle = (a, ah, b, bh, c, ch, nx, ny, nz, color) => {
            const ux = b.x - a.x, uy = bh - ah, uz = a.y - b.y;
            const vx = c.x - a.x, vy = ch - ah, vz = a.y - c.y;
            if ((uy * vz - uz * vy) * nx + (uz * vx - ux * vz) * ny + (ux * vy - uy * vx) * nz < 0) {
              const point = b, height = bh;
              b = c;
              bh = ch;
              c = point;
              ch = height;
            }
            positions.push(
              a.x,
              ah + groundOffset(a),
              -a.y,
              b.x,
              bh + groundOffset(b),
              -b.y,
              c.x,
              ch + groundOffset(c),
              -c.y
            );
            normals.push(nx, ny, nz, nx, ny, nz, nx, ny, nz);
            colors.push(color.r, color.g, color.b, color.r, color.g, color.b, color.r, color.g, color.b);
            if (backend.options.nightLight) uvs.push(...a.uv, ...b.uv, ...c.uv);
          };
          let deadline = performance.now() + 8;
          for (const feature of features) {
            if (area.request.signal.aborted) return;
            if (performance.now() >= deadline) {
              await new Promise(requestAnimationFrame);
              if (area.request.signal.aborted) return;
              deadline = performance.now() + 8;
            }
            const geometry = feature.geometry;
            const isTree = geometry?.type === "Point";
            if (backend.options.nightLight && !isTree) throw new Error("Night lights require Point geometry");
            const polygons = geometry?.type === "Polygon" ? [geometry.coordinates] : geometry?.type === "MultiPolygon" ? geometry.coordinates : null;
            if (!polygons && !isTree) throw new Error("Unsupported GeoJSON geometry");
            const [lon, lat] = (isTree ? geometry.coordinates : polygons[0]?.[0]?.[0]) ?? [];
            if (!Number.isFinite(lon) || !Number.isFinite(lat)) throw new Error("Invalid GeoJSON coordinates");
            const anchor = map.project(new L.LatLng(lat, lon), coords.z);
            if (Math.floor(anchor.x / 256) !== coords.x || Math.floor(anchor.y / 256) !== coords.y) continue;
            const style = backend.options.featureStyle(feature);
            if (style === null) {
              skipped++;
              continue;
            }
            if (!style || typeof style !== "object") throw new Error("featureStyle must return an extrusion style or null");
            const { top, bottom = 0, color = 14267276 } = style;
            if (!Number.isFinite(top) || !Number.isFinite(bottom) || bottom < 0 || top <= bottom) {
              throw new Error("Invalid extrusion heights: expected top > bottom >= 0");
            }
            const baseColor = parseColor(color);
            const vertexStart = positions.length / 3;
            if (isTree) {
              const point = crs.project(new L.LatLng(lat, lon));
              const elevation = map._terrain3D?._getElevation([lat, lon]);
              const projected = {
                x: (point.x - origin.x) * metres,
                y: (point.y - origin.y) * metres,
                ground: Number.isFinite(elevation) && Number.isFinite(backend.root.position[1]) ? elevation - backend.root.position[1] : 0
              };
              if (backend.options.nightLight) {
                if (!Number.isFinite(style.lightFlux) || style.lightFlux <= 0) throw new Error("Invalid light flux");
                const support = feature.properties?.cod_ouvrag || `${lon},${lat}`;
                if (style.poleRadius > 0 && !supports.has(support)) {
                  lampPostGeometry(projected, style, addTriangle);
                  supports.add(support);
                }
                lightGeometry(projected, style, addTriangle);
                lights.push({
                  position: [projected.x, projected.ground + top, -projected.y],
                  radius: Math.hypot(top, style.lightRadius),
                  color: [baseColor.r, baseColor.g, baseColor.b],
                  flux: style.lightFlux
                });
              } else treeGeometry(projected, style, addTriangle);
            }
            for (const rings of polygons || []) {
              if (!rings.length) throw new Error("Empty GeoJSON polygon");
              const paths = rings.map((ring) => {
                if (ring.length < 4) throw new Error("Invalid GeoJSON polygon ring");
                return ring.slice(0, -1).map(([lng, lat2]) => {
                  if (!Number.isFinite(lng) || !Number.isFinite(lat2)) throw new Error("Invalid GeoJSON coordinates");
                  const point = crs.project(new L.LatLng(lat2, lng));
                  const elevation = backend._map._terrain3D?._getElevation([lat2, lng]);
                  return {
                    x: (point.x - origin.x) * metres,
                    y: (point.y - origin.y) * metres,
                    ground: Number.isFinite(elevation) && Number.isFinite(backend.root.position[1]) ? elevation - backend.root.position[1] : 0
                  };
                });
              });
              const points = paths.flat();
              for (const [a, b, c] of triangulate(paths[0], paths.slice(1))) {
                addTriangle(points[a], top, points[b], top, points[c], top, 0, 1, 0, baseColor);
                if (bottom > 0) addTriangle(points[a], bottom, points[b], bottom, points[c], bottom, 0, -1, 0, baseColor);
              }
              paths.forEach((path, index) => {
                const sign = isClockWise(path) === (index === 0) ? -1 : 1;
                for (let i = 0; i < path.length; i++) {
                  const a = path[i], b = path[(i + 1) % path.length];
                  const length = Math.hypot(b.x - a.x, b.y - a.y);
                  if (!length) continue;
                  const nx = sign * (b.y - a.y) / length, nz = sign * (b.x - a.x) / length;
                  addTriangle(a, bottom, b, bottom, b, top, nx, 0, nz, baseColor);
                  addTriangle(a, bottom, b, top, a, top, nx, 0, nz, baseColor);
                }
              });
            }
            const vertexEnd = positions.length / 3;
            featureFaces.push({
              id: feature.id ?? feature.properties?.objectid ?? JSON.stringify(geometry),
              properties: feature.properties,
              baseColor,
              faceStart: vertexStart / 3,
              faceEnd: vertexEnd / 3,
              vertexStart,
              vertexEnd
            });
          }
          if (!positions.length) {
            Object.assign(area, { mesh: null, buildings: 0, skipped, done: true });
            return;
          }
          const device = backend.renderer.device;
          const attributes = {
            position: { size: 3, data: new Float32Array(positions) },
            normal: { size: 3, data: new Float32Array(normals) },
            color: { size: 3, data: new Float32Array(colors) }
          };
          if (backend.options.nightLight) attributes.uv = { size: 2, data: new Float32Array(uvs) };
          for (const [name, attribute] of Object.entries(attributes)) {
            attribute.count = attribute.data.length / attribute.size;
            attribute.buffer = device.createBuffer({
              size: Math.max(4, attribute.data.byteLength),
              usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
            });
            device.queue.writeBuffer(attribute.buffer, 0, attribute.data);
          }
          const meshGeometry = {
            device,
            attributes,
            drawRange: { start: 0, count: attributes.position.count }
          };
          Object.assign(area, {
            mesh: {
              ...emptyNode(),
              device,
              geometry: meshGeometry,
              program: backend._createProgram({
                vertexColors: true,
                roofTexture: Boolean(backend.options.roofTexture),
                ...backend.options.nightLight ? { nightLight: true, alphaMode: "BLEND", doubleSided: true } : {}
              }),
              id: L.Layer.types["3d"]._nextId++,
              renderOrder: 0,
              extras: { featureFaces, lights }
            },
            buildings: featureFaces.length,
            skipped,
            done: true
          });
          backend.add(area.mesh);
        } catch (error) {
          if (area.request.signal.aborted) return;
          area.error = error.message;
          backend.fire("error", { error });
        }
      })().finally(() => {
        backend._inflight--;
        backend._pump();
      });
    }
    backend._updateStatus();
  }
  function releaseArea(backend, area) {
    area.request.abort();
    if (area.mesh) {
      if (backend.highlightedFeature?.mesh === area.mesh) {
        backend._setHighlight(null);
        backend.hoveredFeature = null;
        backend._showFeature(null);
      }
      backend.remove(area.mesh);
      const geometry = area.mesh.geometry;
      for (const attribute of Object.values(geometry.attributes)) attribute.buffer.destroy();
      backend._removeProgram(area.mesh.program);
    }
  }
  function updateStatus(backend, enabled = true) {
    const progress = { enabled, loaded: 0, skipped: 0, pending: 0, errors: [] };
    for (const area of backend._areas.values()) {
      if (area.error) progress.errors.push(area.error);
      else if (!area.done) progress.pending++;
      progress.loaded += area.buildings ?? 0;
      progress.skipped += area.skipped ?? 0;
    }
    backend.fire("progress", progress);
  }
  var init_sources = __esm({
    "src/scene/sources.js"() {
      init_geometry();
      init_scene();
    }
  });

  // src/types/3d.js
  var d_exports = {};
  var init_d = __esm({
    "src/types/3d.js"() {
      init_geometry();
      init_gpu();
      init_lighting2();
      init_model2();
      init_picking2();
      init_pmtiles2();
      init_pmtiles();
      init_render();
      init_scene();
      init_sources();
      L.Layer.types["3d"] = L.Layer.extend({
        color(value) {
          return parseColor(value);
        },
        _setVertexColor(mesh, start, end, color) {
          setVertexColor(mesh, start, end, color);
          return this.update();
        },
        _triangulate(contour, holes) {
          return triangulate(contour, holes);
        },
        _isClockWise(points) {
          return isClockWise(points);
        },
        _treeGeometry(point, style, addTriangle) {
          return treeGeometry(point, style, addTriangle);
        },
        _lightGeometry(point, style, addTriangle) {
          return lightGeometry(point, style, addTriangle);
        },
        _lampPostGeometry(point, style, addTriangle) {
          return lampPostGeometry(point, style, addTriangle);
        },
        _attach(map) {
          return attach(this, map);
        },
        _destroyTexture(texture) {
          return destroyTexture(this, texture);
        },
        _createProgram(material) {
          return createProgram(this, material);
        },
        _removeProgram(program) {
          return removeProgram(program);
        },
        _createMesh(data, material, usage) {
          return createMesh(this, data, material, usage);
        },
        _disposeMesh(mesh) {
          return disposeMesh(this, mesh);
        },
        _computeBounds(geometry) {
          return computeBounds(geometry);
        },
        _drawGeometry(mesh, pass, cullMode, frontFace) {
          return drawGeometry(this, mesh, pass, cullMode, frontFace);
        },
        _initSunlight() {
          return initSunlight(this);
        },
        _resizeSunlight(size) {
          return resizeSunlight(this, size);
        },
        _bindSunlight() {
          return bindSunlight(this);
        },
        _updatePointLights() {
          return updatePointLights(this);
        },
        _renderSunlight(encoder, meshes, sunlight) {
          return renderSunlight(this, encoder, meshes, sunlight);
        },
        _loadModel() {
          return loadModel(this);
        },
        raycast(event, objects, recursive) {
          return raycast(this, event, objects, recursive);
        },
        _findFeature(event) {
          return findFeature(this, event);
        },
        _setHighlight(feature) {
          return setHighlight(this, feature);
        },
        _showFeature(feature, event) {
          return showFeature(this, feature, event);
        },
        _onPointerMove(event) {
          return onPointerMove(this, event);
        },
        _onClick(event) {
          return onClick(this, event);
        },
        _onPointerLeave() {
          return onPointerLeave(this);
        },
        _read(offset, length, signal) {
          return read(this, offset, length, signal);
        },
        _decompress(data, compression) {
          return decompress(data, compression);
        },
        getHeader() {
          return getHeader(this);
        },
        getZxy(z, x, y, signal) {
          return getZxy(this, z, x, y, signal);
        },
        update() {
          return update(this);
        },
        _onMapChange() {
          return onMapChange(this);
        },
        _getTileLevel() {
          return getTileLevel(this);
        },
        _startZoom() {
          return startZoom(this);
        },
        _endZoom() {
          return endZoom(this);
        },
        _render() {
          return render(this);
        },
        setParent(node, parent) {
          return setParent(node, parent);
        },
        traverse(node, callback) {
          return traverse(node, callback);
        },
        _updateWorldMatrix(node) {
          return updateWorldMatrix(node);
        },
        _updateCamera(camera) {
          return updateCamera(camera);
        },
        _onTerrainChange() {
          return onTerrainChange(this);
        },
        _updateArea() {
          return updateArea(this);
        },
        _pump() {
          return pump(this);
        },
        _releaseArea(area) {
          return releaseArea(this, area);
        },
        _updateStatus(enabled) {
          return updateStatus(this, enabled);
        },
        statics: {
          /** Rendering owner per map; entries are removed on the last layer removal. */
          _renderers: /* @__PURE__ */ new WeakMap()
        },
        options: {
          // Accessible description of the canvas.
          ariaLabel: "3D scene"
        },
        /**
         * @param {Layer3DOptions} [options] World origin comes from center or the first map centre.
         * Public state: `location` is fixed after first addition; `root` is this layer's
         * transform; `group` aliases root only for sources; `model` is the configured
         * model wrapper. `_shared` references the rendering owner (a '3d' layer);
         * `scene`, `camera` and `renderer` alias its resources while attached.
         *
         */
        initialize(options) {
          L.Util.setOptions(this, options);
          const model = /\.(glb|gltf)(?:[?#]|$)/i.test(this.options.url);
          this.modelUrl = model ? this.options.url : null;
          this.url = this.options.url && !model ? new URL(this.options.url, document.baseURI).href : null;
          this._directories = /* @__PURE__ */ new Map();
          if (this.options.center) {
            this.location = new L.LatLng(this.options.center[0], this.options.center[1]);
          }
          this._areas = /* @__PURE__ */ new Map();
          this._inflight = 0;
          this._added = Promise.withResolvers();
          queueMicrotask(async () => {
            try {
              this.root = emptyNode();
              this.raycaster = {
                origin: [0, 0, 0],
                direction: [0, 0, 0]
              };
              if (this.url) {
                this.group = this.root;
                this.header = await this.getHeader();
              }
              if (this._map) await this._attach(this._map);
              if (this.modelUrl) await this._loadModel();
              if (this._shared) this.update();
              this.fire("ready");
            } catch (error) {
              this.fire("error", { error });
            }
          });
        },
        /** Attach interaction immediately; initialization may finish before or after onAdd. */
        onAdd(map) {
          this._added.resolve();
          if (!this.location) {
            const center = map.getCenter();
            this.location = new L.LatLng(center.lat, center.lng);
          }
          if (this.url || this.options.tooltipContent || this.modelUrl) {
            this.container = map.getContainer();
            if (this.options.tooltipContent) {
              this._tooltip = L.DomUtil.create("div", "leaflet-3d-tooltip", this.container);
              this._tooltip.hidden = true;
              this._tooltip.setAttribute("role", "tooltip");
              this._tooltip.setAttribute("aria-live", "polite");
              this._tooltip.style.cssText = "position:absolute;z-index:600;max-width:220px;padding:10px 12px;border:1px solid #6b5140;border-radius:6px;background:#fffaf0;box-shadow:0 3px 12px #0005;color:#30251d;font:13px/1.45 sans-serif;pointer-events:none";
            }
            L.DomEvent.on(this.container, {
              mousemove: this._onPointerMove,
              click: this._onClick,
              mouseleave: this._onPointerLeave
            }, this);
          }
          if (this.root) {
            this._attach(map).catch((error) => this.fire("error", { error }));
          }
        },
        /** Reconcile source coverage when the visible ground footprint changes. */
        getEvents() {
          return this.url ? {
            moveend: this._updateArea,
            zoomend: this._updateArea,
            rotate: this._updateArea,
            pitch: this._updateArea,
            resize: this._updateArea,
            terrainchange: this._onTerrainChange
          } : {};
        },
        /** Release source meshes/UI; retain manually added objects and model CPU data. */
        onRemove(map) {
          this._added = Promise.withResolvers();
          if (this.container) {
            this._onPointerLeave();
            L.DomEvent.off(this.container, {
              mousemove: this._onPointerMove,
              click: this._onClick,
              mouseleave: this._onPointerLeave
            }, this);
            this.container = null;
          }
          for (const area of this._areas.values()) this._releaseArea(area);
          this._areas.clear();
          this._tooltip?.remove();
          this._tooltip = null;
          if (this.url) this._updateStatus(false);
          const shared = this._shared;
          if (!shared) return;
          this.setParent(this.root, null);
          shared._layers.delete(this);
          if (shared === this) {
            map.off("move zoom rotate pitch resize viewreset layeradd layerremove", this._onMapChange, this);
            map.off("zoomstart", this._startZoom, this);
            map.off("zoomanim", this.update, this);
            map.off("zoomend", this._endZoom, this);
            cancelAnimationFrame(this._frame);
            this._frame = null;
            this._queued = false;
            if (this._layers.size) {
              const next = this._layers.values().next().value;
              for (const key of ["_layers", "_sceneOrigin", "_size", "_zoomLevel", "_zoomTransitions", "_cursor", "_roofRaster", "_roofTiles"]) {
                next[key] = this[key];
                delete this[key];
              }
              for (const layer of next._layers) layer._shared = next;
              L.Layer.types["3d"]._renderers.set(map, next);
              map.on("move zoom rotate pitch resize viewreset layeradd layerremove", next._onMapChange, next);
              map.on("zoomstart", next._startZoom, next);
              map.on("zoomanim", next.update, next);
              map.on("zoomend", next._endZoom, next);
              next.update();
            } else {
              if (this._roofRaster) this._destroyTexture(this._roofRaster.texture.texture);
              this._roofRaster = null;
              for (const source of this._roofTiles?.values() || []) this._destroyTexture(source.texture);
              this._roofTiles = null;
              for (const animation of this._zoomTransitions?.keys() || []) animation.play();
              this._zoomTransitions = null;
              this.renderer.canvas.remove();
              const renderer = this.renderer;
              const resources = [
                renderer.depthTexture,
                renderer.roofFallbackTexture.texture,
                renderer.uniformBuffer,
                renderer.sunlight?.texture,
                renderer.sunlight?.buffer,
                renderer.sunlight?.lights
              ].filter(Boolean);
              renderer.device.queue.onSubmittedWorkDone().then(() => {
                for (const resource of resources) resource.destroy();
                renderer.device.destroy();
              }, (error) => {
                this.fire("error", { error });
                renderer.device.destroy();
              });
              L.Layer.types["3d"]._renderers.delete(map);
              for (const key of ["_layers", "_sceneOrigin", "_size", "_zoomLevel", "_cursor"]) delete this[key];
            }
          } else shared.update();
          this._shared = null;
          this.renderer = this.scene = this.camera = null;
        },
        /**
         * Adds a scene node or mesh in layer-local coordinates and schedules a redraw.
         * Requires initialization and a compatible scene node.
         * @param {Object} object
         * @returns {L.Layer} This layer.
         */
        add(object) {
          this.setParent(object, this.root);
          return this.update();
        },
        _setTerrainHeight() {
          if (!this.root || !this.location) return;
          this._terrainBaseY ??= this.root.position[1];
          this.root.position[1] = this._terrainBaseY + (this._map?._terrain3D?._getElevation(this.location) ?? 0);
        },
        /**
         * Without an argument, removes this Leaflet layer. With an object, only detaches it:
         * geometry/program resources are not disposed, so it can be added again.
         * @param {Object} [object]
         * @returns {L.Layer}
         */
        remove(object) {
          if (object === void 0) return L.Layer.prototype.remove.call(this);
          this.setParent(object, null);
          return this.update();
        }
      });
      L.Layer.types["3d"]._nextId = 0;
    }
  });

  // src/types/pmtiles.js
  var pmtiles_exports3 = {};
  var init_pmtiles3 = __esm({
    "src/types/pmtiles.js"() {
      init_d();
      init_pmtiles2();
      init_pmtiles();
      L.Layer.types.pmtiles = L.TileLayer.extend({
        _read(offset, length, signal) {
          return read(this, offset, length, signal);
        },
        _decompress(data, compression) {
          return decompress(data, compression);
        },
        getHeader() {
          return getHeader(this);
        },
        getZxy(z, x, y, signal) {
          return getZxy(this, z, x, y, signal);
        },
        initialize(options) {
          L.TileLayer.prototype.initialize.call(this, options.url, options);
          this.url = new URL(options.url, document.baseURI).href;
          this._directories = /* @__PURE__ */ new Map();
          this.on("tileunload", this._releaseTile, this);
          this.on("load tileunload", () => L.Layer.types["3d"]._renderers.get(this._map)?.update());
          this.ready = Promise.resolve(this.options.archive || this).then(async (archive) => {
            const header = await archive.getHeader();
            this.options.archive = archive;
            this.header = header;
            if (this.options.maxNativeZoom === void 0) this.options.maxNativeZoom = header.maxZoom;
            this.fire("ready");
            return this;
          }).catch((error) => {
            this.fire("error", { error });
            throw error;
          });
        },
        onAdd(map) {
          if (this.header) {
            L.TileLayer.prototype.onAdd.call(this, map);
            this._setTerrain3D(map._terrain3D);
          } else {
            this.ready = this.ready.then((layer) => {
              if (this._map === map && map.hasLayer(this) && !this._container) {
                L.TileLayer.prototype.onAdd.call(this, map);
                this._setTerrain3D(map._terrain3D);
              }
              return layer;
            });
          }
        },
        onRemove(map) {
          this._setTerrain3D(null);
          if (this._container) L.TileLayer.prototype.onRemove.call(this, map);
        },
        setOpacity(opacity) {
          L.TileLayer.prototype.setOpacity.call(this, opacity);
          L.Layer.types["3d"]._renderers.get(this._map)?.update();
          return this;
        },
        setZIndex(zIndex) {
          L.TileLayer.prototype.setZIndex.call(this, zIndex);
          L.Layer.types["3d"]._renderers.get(this._map)?.update();
          return this;
        },
        createTile(coords, done) {
          const tile = document.createElement("img");
          tile.alt = "";
          if (this.options.crossOrigin || this.options.crossOrigin === "") {
            tile.crossOrigin = this.options.crossOrigin === true ? "" : this.options.crossOrigin;
          }
          if (typeof this.options.referrerPolicy === "string") tile.referrerPolicy = this.options.referrerPolicy;
          tile.request = new AbortController();
          this.ready.then(() => {
            if (tile.request.signal.aborted) return;
            return this.options.archive.getZxy(coords.z, coords.x, coords.y, tile.request.signal);
          }).then(async (result) => {
            if (tile.request.signal.aborted) return;
            if (!result) throw new Error(`Tile ${coords.z}/${coords.x}/${coords.y} is not in the offline archive`);
            await new Promise((resolve, reject) => {
              const finish = (error) => {
                tile.request.signal.removeEventListener("abort", abort);
                tile.onload = tile.onerror = null;
                this._releaseURL(tile);
                if (error) reject(error);
                else resolve();
              };
              const abort = () => finish();
              tile.request.signal.addEventListener("abort", abort, { once: true });
              tile.objectURL = URL.createObjectURL(new Blob([result.data]));
              tile.onload = () => finish();
              tile.onerror = () => finish(new Error(`Unable to decode tile ${coords.z}/${coords.x}/${coords.y}`));
              tile.src = tile.objectURL;
            });
            if (tile.request.signal.aborted) return;
            tile.done = true;
            this._registerTerrainTile(coords, tile);
            done(null, tile);
          }).catch((error) => {
            if (tile.request.signal.aborted) return;
            tile.error = error.message;
            this._tileOnError(done, tile, error);
          });
          return tile;
        },
        _abortLoading() {
          for (const { coords, el } of Object.values(this._tiles)) {
            if (coords.z !== this._tileZoom) this._releaseTile({ tile: el });
          }
          L.TileLayer.prototype._abortLoading.call(this);
        },
        _setTerrain3D(terrain) {
          if (this._terrain3D === terrain) return;
          for (const { el } of Object.values(this._tiles || {})) this._terrain3D?.removeRasterTile(el);
          this._terrain3D = terrain || null;
          if (this._terrain3D) {
            for (const { coords, el } of Object.values(this._tiles || {})) {
              if (el.done) this._registerTerrainTile(coords, el);
            }
          }
        },
        _registerTerrainTile(coords, tile) {
          if (!this._terrain3D) return;
          const terrain = this._terrain3D;
          terrain.addRasterTile(this, coords, tile).catch((error) => {
            if (this._terrain3D === terrain && tile.isConnected) this.fire("tileerror", { tile, coords, error });
          });
        },
        _releaseURL(tile) {
          if (tile.objectURL) {
            URL.revokeObjectURL(tile.objectURL);
            tile.objectURL = null;
          }
        },
        _releaseTile({ tile }) {
          this._terrain3D?.removeRasterTile(tile);
          tile.request.abort();
          this._releaseURL(tile);
        }
      });
    }
  });

  // src/utils/sun.js
  function solarPosition(date, lat, lng) {
    const time = new Date(date).getTime();
    if (!Number.isFinite(time) || !Number.isFinite(lat) || Math.abs(lat) > 90 || !Number.isFinite(lng) || Math.abs(lng) > 180) throw new Error("Invalid solar date or location");
    const rad = Math.PI / 180, d = time / 864e5 - 10957.5;
    const mean = (357.5291 + 0.98560028 * d) * rad;
    const longitude = mean + (1.9148 * Math.sin(mean) + 0.02 * Math.sin(2 * mean) + 3e-4 * Math.sin(3 * mean) + 102.9372 + 180) * rad;
    const obliquity = 23.4397 * rad;
    const declination = Math.asin(Math.sin(longitude) * Math.sin(obliquity));
    const ascension = Math.atan2(Math.sin(longitude) * Math.cos(obliquity), Math.cos(longitude));
    return horizontalPosition(d, lat, lng, ascension, declination);
  }
  function horizontalPosition(d, lat, lng, ascension, declination) {
    const rad = Math.PI / 180;
    const hourAngle = (280.16 + 360.9856235 * d + lng) * rad - ascension;
    const latitude = lat * rad;
    const altitude = Math.asin(Math.sin(latitude) * Math.sin(declination) + Math.cos(latitude) * Math.cos(declination) * Math.cos(hourAngle));
    const southAzimuth = Math.atan2(
      Math.sin(hourAngle),
      Math.cos(hourAngle) * Math.sin(latitude) - Math.tan(declination) * Math.cos(latitude)
    );
    const azimuth = (southAzimuth / rad + 180 + 360) % 360;
    return {
      altitude: altitude / rad,
      azimuth,
      direction: [
        Math.sin(azimuth * rad) * Math.cos(altitude),
        Math.sin(altitude),
        -Math.cos(azimuth * rad) * Math.cos(altitude)
      ]
    };
  }
  function moonPosition(date, lat, lng) {
    solarPosition(date, lat, lng);
    const rad = Math.PI / 180, d = new Date(date).getTime() / 864e5 - 10957.5;
    const anomaly = (134.963 + 13.064993 * d) * rad;
    const longitude = (218.316 + 13.176396 * d + 6.289 * Math.sin(anomaly)) * rad;
    const latitude = 5.128 * Math.sin((93.272 + 13.22935 * d) * rad) * rad;
    const obliquity = 23.4397 * rad;
    const x = Math.cos(latitude) * Math.cos(longitude);
    const y = Math.cos(latitude) * Math.sin(longitude) * Math.cos(obliquity) - Math.sin(latitude) * Math.sin(obliquity);
    const z = Math.cos(latitude) * Math.sin(longitude) * Math.sin(obliquity) + Math.sin(latitude) * Math.cos(obliquity);
    return horizontalPosition(d, lat, lng, Math.atan2(y, x), Math.asin(z));
  }
  function atmosphere(altitude) {
    if (!Number.isFinite(altitude)) throw new Error("Invalid solar altitude");
    const stops = [
      [-18, [3, 7, 20], [17, 28, 54], [0.025, 0.04, 0.09]],
      [-6, [37, 53, 84], [182, 106, 86], [0.12, 0.1, 0.14]],
      [0, [101, 131, 171], [246, 170, 115], [0.38, 0.24, 0.18]],
      [10, [74, 147, 208], [197, 221, 237], [0.8, 0.75, 0.68]],
      [25, [53, 144, 213], [223, 238, 250], [1, 1, 1]]
    ];
    const upper = stops.findIndex((stop) => stop[0] >= altitude);
    const b = stops[upper < 0 ? stops.length - 1 : upper], a = stops[Math.max(0, upper - 1)];
    const t = a === b || upper < 0 ? 1 : (altitude - a[0]) / (b[0] - a[0]);
    const mix = (index) => a[index].map((value, i) => value + (b[index][i] - value) * t);
    const rgb = (values) => `rgb(${values.map(Math.round).join(", ")})`;
    return { background: `linear-gradient(${rgb(mix(1))}, ${rgb(mix(2))})`, tint: mix(3) };
  }
  function projectCelestialBody(direction, size, pitch, bearing) {
    const [x, y, z] = direction;
    const right = x * Math.cos(bearing) - z * Math.sin(bearing);
    const up = -x * Math.sin(bearing) * Math.cos(pitch) + y * Math.sin(pitch) - z * Math.cos(bearing) * Math.cos(pitch);
    const forward = -x * Math.sin(bearing) * Math.sin(pitch) - y * Math.cos(pitch) - z * Math.cos(bearing) * Math.sin(pitch);
    if (forward <= 0) return null;
    const left = size.x / 2 + size.y * 1.5 * right / forward;
    const top = size.y / 2 - size.y * 1.5 * up / forward;
    return { left, top };
  }
  var init_sun = __esm({
    "src/utils/sun.js"() {
    }
  });

  // src/utils/control.js
  function underEntry(layer, element) {
    const map = layer._map;
    const place = () => {
      const input = [...map.getContainer().querySelectorAll(".leaflet-control-layers-selector")].find((input2) => input2.layerId === globalThis.L.Util.stamp(layer));
      input?.closest("label").after(element);
      return Boolean(input);
    };
    const replace = () => queueMicrotask(() => map.hasLayer(layer) && place());
    map.on("layeradd layerremove", replace);
    layer.once("remove", () => {
      map.off("layeradd layerremove", replace);
      element.remove();
    });
    return place();
  }
  var init_control = __esm({
    "src/utils/control.js"() {
    }
  });

  // src/types/sunlight.js
  var sunlight_exports = {};
  function installSunlight(map) {
    const L2 = globalThis.L;
    const control = new L2.Control({ position: "bottomright" });
    control.live = true;
    let date, slider, output, status, timer;
    const originalSky = map.getContainer().style.getPropertyValue("--leaflet-sky-background");
    const disc = "position:absolute;width:18px;height:18px;border-radius:50%;transform:translate(-50%,-50%);pointer-events:none;";
    const sunDisc = L2.DomUtil.create("div", "sunlight-sun");
    const moonDisc = L2.DomUtil.create("div", "sunlight-moon");
    sunDisc.style.cssText = disc + "background:#fff3bd;box-shadow:0 0 18px 7px #ffd27699;";
    moonDisc.style.cssText = disc + "background:#dce5f2;box-shadow:0 0 10px 2px #cbdcff55;";
    sunDisc.setAttribute("role", "img");
    sunDisc.setAttribute("aria-label", "Sun");
    moonDisc.setAttribute("role", "img");
    moonDisc.setAttribute("aria-label", "Moon");
    const updateSky = () => {
      const sun = map._sunlight, sky = map._pitchSky;
      if (sun) map.getContainer().style.setProperty("--leaflet-sky-background", sun.background);
      else if (originalSky) map.getContainer().style.setProperty("--leaflet-sky-background", originalSky);
      else map.getContainer().style.removeProperty("--leaflet-sky-background");
      const size = map.getSize(), pitch = map.getPitch() * Math.PI / 180, bearing = map.getBearing() * Math.PI / 180;
      for (const [disc2, body] of [[sunDisc, sun], [moonDisc, sun?.moon]]) {
        disc2.hidden = true;
        if (!sky || !body || body.altitude <= 0 || !sun) continue;
        if (disc2.parentNode !== sky) sky.append(disc2);
        const point = projectCelestialBody(body.direction, size, pitch, bearing);
        if (!point) continue;
        const { left, top } = point;
        disc2.hidden = left < 0 || left > size.x || top < 0 || top > sky.clientHeight || sky.style.display === "none";
        disc2.style.left = `${left}px`;
        disc2.style.top = `${top}px`;
      }
    };
    const render2 = () => L2.Layer.types["3d"]?._renderers.get(map)?.update();
    const update2 = () => {
      try {
        if (control.live) control.time = /* @__PURE__ */ new Date();
        const time = control.time.toISOString();
        date.value = time.slice(0, 10);
        slider.value = String(control.time.getUTCHours() * 60 + control.time.getUTCMinutes());
        output.textContent = `${time.slice(11, 16)} UTC${control.live ? " \xB7 now" : ""}`;
        const center = map.getCenter();
        const sun = map._sunlight = solarPosition(control.time, center.lat, center.lng);
        Object.assign(sun, atmosphere(sun.altitude));
        sun.moon = moonPosition(control.time, center.lat, center.lng);
        status.textContent = sun.altitude <= 0 ? "Night \xB7 no direct sunlight" : sun.altitude < 3 ? "Low sun \xB7 shadows paused" : `Sun altitude ${sun.altitude.toFixed(1)}\xB0`;
        map.fire("simulationtimechange", { time: new Date(control.time), live: control.live });
        updateSky();
        render2();
      } catch (error) {
        delete map._sunlight;
        updateSky();
        render2();
        status.textContent = `Error: ${error.message}`;
        console.error("Solar simulation", error);
      }
    };
    const selectTime = () => {
      control.live = false;
      if (!date.value || !date.validity.valid) {
        control.time = /* @__PURE__ */ new Date(NaN);
        map.fire("simulationtimechange", { time: null, live: false });
        delete map._sunlight;
        updateSky();
        render2();
        status.textContent = "Error: choose a valid solar date";
        return;
      }
      control.time = /* @__PURE__ */ new Date(`${date.value}T00:00:00Z`);
      control.time.setUTCMinutes(Number(slider.value));
      update2();
    };
    control.onAdd = () => {
      const container = L2.DomUtil.create("div", "sunlight-control");
      container.style.cssText = "color:#222;width:min(200px,calc(100vw - 60px));font:12px/1.4 sans-serif;";
      date = document.createElement("input");
      date.type = "date";
      date.style.cssText = "width:100%;box-sizing:border-box;";
      date.setAttribute("aria-label", "Solar date (UTC)");
      slider = document.createElement("input");
      slider.type = "range";
      slider.style.cssText = "width:100%;box-sizing:border-box;margin:10px 0 4px;cursor:pointer;";
      slider.min = "0";
      slider.max = "1439";
      slider.step = "1";
      slider.setAttribute("aria-label", "Time of day (UTC)");
      output = document.createElement("output");
      output.style.cssText = "font-weight:bold;font-variant-numeric:tabular-nums;";
      output.setAttribute("aria-live", "off");
      const now = document.createElement("button");
      now.type = "button";
      now.textContent = "Now";
      now.onclick = () => {
        control.live = true;
        update2();
      };
      const timeRow = document.createElement("div");
      timeRow.className = "sunlight-time";
      timeRow.style.cssText = "display:flex;justify-content:space-between;align-items:center;";
      timeRow.append(output, now);
      status = document.createElement("div");
      status.className = "sunlight-status";
      status.style.marginTop = "5px";
      status.setAttribute("role", "status");
      const note = document.createElement("small");
      note.style.color = "#555";
      note.textContent = "Indicative \xB7 loaded geometry only. Streetlight illumination is estimated, not measured lux.";
      container.append(date, slider, timeRow, status, note);
      slider.oninput = selectTime;
      date.onchange = selectTime;
      L2.DomEvent.disableClickPropagation(container);
      L2.DomEvent.disableScrollPropagation(container);
      update2();
      timer = setInterval(() => {
        if (control.live) update2();
      }, 6e4);
      map.on("moveend", update2);
      map.on("move rotate pitch resize", updateSky);
      return container;
    };
    control.onRemove = () => {
      clearInterval(timer);
      map.fire("simulationtimechange", { time: null, live: false });
      map.off("moveend", update2);
      map.off("move rotate pitch resize", updateSky);
      delete map._sunlight;
      updateSky();
      sunDisc.remove();
      moonDisc.remove();
      render2();
    };
    return control;
  }
  var init_sunlight = __esm({
    "src/types/sunlight.js"() {
      init_sun();
      init_control();
      L.Layer.types.sunlight = L.Layer.extend({
        onAdd(map) {
          this.control = this.control || installSunlight(map);
          if (!this.control._map) this.control.addTo(map);
          const container = this.control.getContainer(), nested = underEntry(this, container);
          container.classList.toggle("leaflet-control", !nested);
          container.classList.toggle("leaflet-bar", !nested);
          Object.assign(container.style, nested ? { background: "", padding: "2px 0 6px 20px", margin: "0" } : { background: "#fff", padding: "8px", margin: "" });
        },
        onRemove() {
          this.control.remove();
        }
      });
    }
  });

  // src/utils/terrain.js
  function bridgeElevation(point, bridges) {
    for (const bridge of bridges?.get(`${Math.floor(point.x / 64)}/${Math.floor(point.y / 64)}`) || []) {
      if (point.x < bridge.min[0] || point.x > bridge.max[0] || point.y < bridge.min[1] || point.y > bridge.max[1]) continue;
      for (const [a, b, c] of bridge.triangles) {
        const d = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1]);
        const u = ((b[1] - c[1]) * (point.x - c[0]) + (c[0] - b[0]) * (point.y - c[1])) / d;
        const v = ((c[1] - a[1]) * (point.x - c[0]) + (a[0] - c[0]) * (point.y - c[1])) / d;
        if (u >= 0 && v >= 0 && u + v <= 1) return u * a[2] + v * b[2] + (1 - u - v) * c[2];
      }
    }
    return null;
  }
  function terrainElevation(point, tiles) {
    const x = point.x - 0.5, y = point.y - 0.5;
    const x0 = Math.floor(x), y0 = Math.floor(y);
    const fx = x - x0, fy = y - y0;
    const sample = (px, py) => {
      const tileX = Math.floor(px / 256), tileY = Math.floor(py / 256);
      const tile = tiles.get(`${tileX}/${tileY}`);
      if (!tile) return null;
      const elevation = tile[(py - tileY * 256) * 256 + px - tileX * 256];
      return Number.isFinite(elevation) && elevation > -1e3 ? elevation : null;
    };
    const values = [sample(x0, y0), sample(x0 + 1, y0), sample(x0, y0 + 1), sample(x0 + 1, y0 + 1)];
    const valid = values.map((value, i) => Number.isFinite(value) ? i : -1).filter((i) => i >= 0);
    if (!valid.length) return null;
    if (valid.length < 4) return values[valid[0]];
    return (values[0] * (1 - fx) + values[1] * fx) * (1 - fy) + (values[2] * (1 - fx) + values[3] * fx) * fy;
  }
  function terrainGrid(divisions) {
    const positions = [], normals = [], uvs = [], indices = [];
    for (let row = 0; row <= divisions; row++) {
      for (let column = 0; column <= divisions; column++) {
        positions.push(column / divisions, 0, row / divisions);
        normals.push(0, 1, 0);
        uvs.push(column / divisions, row / divisions);
        if (row < divisions && column < divisions) {
          const a = row * (divisions + 1) + column;
          const b = a + 1, c = a + divisions + 1, d = c + 1;
          indices.push(a, c, b, b, c, d);
        }
      }
    }
    return {
      position: { size: 3, data: new Float32Array(positions) },
      normal: { size: 3, data: new Float32Array(normals) },
      uv: { size: 2, data: new Float32Array(uvs) },
      index: { data: new Uint16Array(indices) }
    };
  }
  function terrainAtlas(tiles, bounds) {
    const columns = bounds.max.x - bounds.min.x + 1, rows = bounds.max.y - bounds.min.y + 1;
    const elevations = new Float32Array(columns * rows * 65536).fill(-1e9);
    let low = Infinity, high = -Infinity;
    for (const [key, values] of tiles) {
      const [x, y] = key.split("/").map(Number);
      const start = (y - bounds.min.y) * 256 * columns * 256 + (x - bounds.min.x) * 256;
      for (let row = 0; row < 256; row++) {
        for (let column = 0; column < 256; column++) {
          const value = values[row * 256 + column];
          if (!Number.isFinite(value) || value <= -1e3) continue;
          elevations[start + row * columns * 256 + column] = value;
          low = Math.min(low, value);
          high = Math.max(high, value);
        }
      }
    }
    return { elevations, low, high };
  }
  var init_terrain = __esm({
    "src/utils/terrain.js"() {
    }
  });

  // src/types/terrain.js
  var terrain_exports = {};
  var init_terrain2 = __esm({
    "src/types/terrain.js"() {
      init_terrain();
      init_geometry();
      init_d();
      init_pmtiles3();
      L.Layer.types.terrain = L.Layer.types["3d"].extend({
        initialize(options = {}) {
          const terrainSource = options.url;
          const layerOptions = { ...options };
          delete layerOptions.url;
          L.Layer.types["3d"].prototype.initialize.call(this, layerOptions);
          this.terrainSource = terrainSource;
          this._terrainTiles = /* @__PURE__ */ new Map();
          this._rasterTiles = /* @__PURE__ */ new Map();
          this._terrainReady = false;
        },
        onAdd(map) {
          if (map._terrain3D && map._terrain3D !== this) throw new Error("Only one terrain layer can be active per map");
          map._terrain3D = this;
          L.Layer.types["3d"].prototype.onAdd.call(this, map);
          this._terrainPromise = this.root ? this._loadTerrain() : new Promise((resolve) => this.once("ready", () => this._loadTerrain().then(resolve), this));
          map.eachLayer((layer) => layer._setTerrain3D?.(this));
          map.fire("terrainchange");
        },
        onRemove(map) {
          this._terrainController?.abort();
          this._terrainLoading = false;
          this._terrainReady = false;
          map.eachLayer((layer) => layer._setTerrain3D?.(null));
          for (const tile of this._rasterTiles.keys()) this.removeRasterTile(tile);
          if (map._terrain3D === this) delete map._terrain3D;
          for (const layer of Object.values(map._layers)) layer._setTerrainHeight?.();
          map.fire("terrainchange");
          this._terrainTiles.clear();
          this._terrainOriginElevation = 0;
          this._terrainPromise = null;
          if (this._rasterProgram) this._removeProgram(this._rasterProgram);
          this._rasterProgram = null;
          if (this._dem) this._destroyTexture(this._dem.texture);
          this._dem = null;
          for (const grid of this._terrainGrids?.values() || []) {
            for (const attribute of Object.values(grid)) this._destroyTexture(attribute.buffer);
          }
          this._terrainGrids = null;
          this._bridges = null;
          this._disposeMesh(this._bridgeMesh);
          this._bridgeMesh = null;
          L.Layer.types["3d"].prototype.onRemove.call(this, map);
        },
        async _loadTerrain() {
          if (this._terrainLoading || !this._map) return;
          this._terrainLoading = true;
          this._terrainReady = false;
          const controller = this._terrainController = new AbortController();
          try {
            if (!this.terrainSource) throw new Error("Terrain layer requires a PMTiles elevation archive");
            const archive = this._terrainArchive = new L.Layer({ source: { type: "pmtiles", url: this.terrainSource } });
            await archive.ready;
            const header = archive.header;
            if (header.tileType !== 0 || header.minZoom !== header.maxZoom) {
              throw new Error("Expected a single-zoom Float32 PMTiles terrain archive");
            }
            this._terrainZoom = header.maxZoom;
            const map = this._map;
            const northwest = map.project([header.maxLat, header.minLon], this._terrainZoom).divideBy(256).floor();
            const southeast = map.project([header.minLat, header.maxLon], this._terrainZoom).divideBy(256).floor();
            this._terrainBounds = new L.Bounds(northwest, southeast);
            const tiles = [];
            for (let x = northwest.x; x <= southeast.x; x++) {
              for (let y = northwest.y; y <= southeast.y; y++) tiles.push({ z: this._terrainZoom, x, y });
            }
            let next = 0;
            await Promise.all(Array.from({ length: Math.min(4, tiles.length) }, async () => {
              while (next < tiles.length) {
                controller.signal.throwIfAborted();
                const coords = tiles[next++];
                const result = await archive.getZxy(coords.z, coords.x, coords.y, controller.signal);
                if (!result || result.data.byteLength !== 256 * 256 * 4) {
                  throw new Error(`Missing or invalid Float32 terrain tile ${coords.z}/${coords.x}/${coords.y}`);
                }
                this._terrainTiles.set(`${coords.x}/${coords.y}`, new Float32Array(result.data));
              }
            }));
            const bridges = this.options.bridges && await fetch(this.options.bridges, { signal: controller.signal }).then((response) => {
              if (!response.ok) throw new Error(`Bridges: HTTP ${response.status}`);
              return response.json();
            });
            if (controller.signal.aborted || this._map !== map) return;
            this._terrainReady = true;
            this._terrainOriginElevation = this._getElevation(this.location) ?? 0;
            for (const layer of Object.values(map._layers)) layer._setTerrainHeight?.();
            if (bridges) this._addBridges(bridges);
            map.fire("terrainchange");
            this.update();
            this.fire("terrainready");
            return true;
          } catch (error) {
            if (!controller.signal.aborted) this.fire("error", { error });
            return false;
          } finally {
            this._terrainLoading = false;
          }
        },
        /** @param {L.LatLng|L.Point} location LatLng, or a pixel point at the terrain zoom. */
        _getElevation(location) {
          if (!this._map || !this._terrainReady) return null;
          const point = location instanceof L.Point ? location : this._map.project(location, this._terrainZoom);
          return bridgeElevation(point, this._bridges) ?? terrainElevation(point, this._terrainTiles);
        },
        /**
         * Bare-earth DEMs drop bridges: `_getElevation` returns the deck height inside these polygons (GeoJSON
         * Polygon/MultiPolygon with Z, e.g. IGN BD TOPO), and one mesh draws the 1.2 m thick decks.
         * ponytail: anything under a deck (quays, boats asking `_getElevation`) also gets the deck height.
         */
        _addBridges(geojson) {
          const map = this._map, crs = map.options.crs, zoom = this._terrainZoom;
          const origin = crs.project(this.location), metres = Math.cos(this.location.lat * Math.PI / 180);
          const base = this.root.position[1], position = [], normal = [], color = [];
          const local = ([lng, lat, z]) => {
            const p = crs.project(new L.LatLng(lat, lng));
            return [(p.x - origin.x) * metres, z - base, -(p.y - origin.y) * metres];
          };
          const push = (p, n) => {
            position.push(...p);
            normal.push(...n);
            color.push(0.6, 0.58, 0.54);
          };
          this._bridges = /* @__PURE__ */ new Map();
          for (const { geometry } of geojson.features) {
            const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.type === "MultiPolygon" ? geometry.coordinates : [];
            for (const polygon of polygons) {
              const rings = polygon.map((ring) => ring.slice(0, -1)).filter((ring) => ring.length >= 3);
              if (!rings.length) continue;
              const pixels = rings.flat().map(([lng, lat, z]) => {
                const p = map.project([lat, lng], zoom);
                return [p.x, p.y, z];
              });
              const points = rings.flat().map(local);
              let triangles;
              try {
                const starts = rings.map((ring, r) => rings.slice(0, r).reduce((sum, previous) => sum + previous.length, 0));
                const [contour, ...holes] = rings.map((ring, r) => ring.map((c, i) => ({ x: pixels[starts[r] + i][0], y: pixels[starts[r] + i][1] })));
                triangles = triangulate(contour, holes);
              } catch {
                continue;
              }
              const bridge = {
                triangles: triangles.map((t) => t.map((i) => pixels[i])),
                min: [Math.min(...pixels.map((p) => p[0])), Math.min(...pixels.map((p) => p[1]))],
                max: [Math.max(...pixels.map((p) => p[0])), Math.max(...pixels.map((p) => p[1]))]
              };
              for (let x = Math.floor(bridge.min[0] / 64); x <= Math.floor(bridge.max[0] / 64); x++) {
                for (let y = Math.floor(bridge.min[1] / 64); y <= Math.floor(bridge.max[1] / 64); y++) {
                  const key = `${x}/${y}`;
                  this._bridges.set(key, [...this._bridges.get(key) || [], bridge]);
                }
              }
              const below = (p) => [p[0], p[1] - 1.2, p[2]];
              for (let [a, b, c] of triangles) {
                const [pa, pb, pc] = [points[a], points[b], points[c]];
                if ((pb[2] - pa[2]) * (pc[0] - pa[0]) - (pb[0] - pa[0]) * (pc[2] - pa[2]) < 0) [b, c] = [c, b];
                for (const i of [a, b, c]) push(points[i], [0, 1, 0]);
                for (const i of [a, c, b]) push(below(points[i]), [0, -1, 0]);
              }
              let start = 0;
              for (const ring of rings) {
                for (let i = 0; i < ring.length; i++) {
                  const p = points[start + i], q = points[start + (i + 1) % ring.length];
                  const length = Math.hypot(q[0] - p[0], q[2] - p[2]) || 1, n = [(q[2] - p[2]) / length, 0, -(q[0] - p[0]) / length];
                  for (const corner of [p, q, below(q), p, below(q), below(p)]) push(corner, n);
                }
                start += ring.length;
              }
            }
          }
          if (position.length) this._bridgeMesh = this._createMesh({ position, normal, color });
        },
        async addRasterTile(layer, coords, tile) {
          const [ready, bitmap] = await Promise.all([this._terrainPromise, createImageBitmap(tile)]);
          if (!ready || !this._map || this._map._terrain3D !== this || layer._terrain3D !== this || tile.request.signal.aborted || !tile.isConnected || this._rasterTiles.has(tile)) {
            bitmap.close();
            return;
          }
          const divisions = Math.max(1, Math.min(64, 256 / 2 ** (coords.z - this._terrainZoom)));
          const map = this._map, crs = map.options.crs;
          const origin = crs.project(this.location), metres = Math.cos(this.location.lat * Math.PI / 180);
          const scale = crs.scale(coords.z), terrainScale = 2 ** (this._terrainZoom - coords.z);
          const corner = crs.transformation.untransform(new L.Point(coords.x * 256, coords.y * 256), scale);
          const opposite = crs.transformation.untransform(new L.Point((coords.x + 1) * 256, (coords.y + 1) * 256), scale);
          const device = this.renderer.device;
          const texture = {
            device,
            texture: device.createTexture({
              size: [tile.width, tile.height],
              format: "rgba8unorm",
              usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
            }),
            sampler: device.createSampler({ addressModeU: "clamp-to-edge", addressModeV: "clamp-to-edge" }),
            samplerOptions: { addressModeU: "clamp-to-edge", addressModeV: "clamp-to-edge" },
            image: tile,
            format: "rgba8unorm",
            srgb: false,
            flipY: false,
            uploaded: tile
          };
          device.queue.copyExternalImageToTexture({ source: bitmap }, { texture: texture.texture }, [tile.width, tile.height]);
          bitmap.close();
          if (!this._rasterProgram || this._rasterProgram.device !== device) {
            const bounds = this._terrainBounds, columns = bounds.max.x - bounds.min.x + 1, rows = bounds.max.y - bounds.min.y + 1;
            const { elevations, low, high } = terrainAtlas(this._terrainTiles, bounds);
            if (this._dem) this._destroyTexture(this._dem.texture);
            this._dem = {
              texture: device.createTexture({
                size: [columns * 256, rows * 256],
                format: "r32float",
                usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
              }),
              low: Number.isFinite(low) ? low : this._terrainOriginElevation,
              high: Number.isFinite(high) ? high : this._terrainOriginElevation
            };
            device.queue.writeTexture(
              { texture: this._dem.texture },
              elevations,
              { bytesPerRow: columns * 1024 },
              [columns * 256, rows * 256]
            );
            this._terrainGrids = /* @__PURE__ */ new Map();
            this._rasterProgram = this._createProgram({
              baseTexture: texture,
              unlit: true,
              alphaMode: "BLEND",
              terrain: this._dem
            });
          }
          let attributes = this._terrainGrids.get(divisions);
          if (!attributes) {
            attributes = terrainGrid(divisions);
            for (const [name, attribute] of Object.entries(attributes)) {
              attribute.size ||= 1;
              attribute.count = attribute.data.length / attribute.size;
              attribute.indexFormat = "uint16";
              attribute.buffer = device.createBuffer({
                size: Math.max(4, attribute.data.byteLength),
                usage: name === "index" ? GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST : GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
              });
              device.queue.writeBuffer(attribute.buffer, 0, attribute.data);
            }
            this._terrainGrids.set(divisions, attributes);
          }
          const base = this._terrainOriginElevation;
          const bottom = Math.min(this._dem.low, base) - base, top = Math.max(this._dem.high, base) - base;
          const sizeX = (opposite.x - corner.x) * metres, sizeZ = -(opposite.y - corner.y) * metres;
          const geometry = {
            device,
            attributes,
            drawRange: { start: 0, count: attributes.index.count },
            // Local bounds whose radius, scaled by the largest axis, still covers the displaced tile.
            bounds: {
              min: [0, bottom, 0],
              max: [1, top, 1],
              center: [0.5, (bottom + top) / 2, 0.5],
              radius: Math.hypot(sizeX, top - bottom, sizeZ) / 2 / Math.max(sizeX, 1, sizeZ)
            }
          };
          const mesh = {
            position: [(corner.x - origin.x) * metres, 0, -(corner.y - origin.y) * metres],
            rotation: [0, 0, 0],
            scale: [sizeX, 1, sizeZ],
            worldMatrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
            children: [],
            visible: true,
            device,
            geometry,
            program: this._rasterProgram,
            texture,
            // DEM pixel of the tile's corner, DEM pixels per tile, and the elevation at the layer origin.
            terrain: [
              coords.x * 256 * terrainScale - this._terrainBounds.min.x * 256,
              coords.y * 256 * terrainScale - this._terrainBounds.min.y * 256,
              256 * terrainScale,
              base
            ],
            tile,
            opacity: layer.options.opacity ?? 1,
            id: L.Layer.types["3d"]._nextId++,
            renderOrder: -1
          };
          this.add(mesh);
          this._rasterTiles.set(tile, mesh);
          tile._terrainVisibility = tile.style.visibility;
        },
        removeRasterTile(tile) {
          tile._terrainRequest?.abort();
          const mesh = this._rasterTiles.get(tile);
          if (!mesh) return;
          this.remove(mesh);
          this._destroyTexture(mesh.texture.texture);
          this._rasterTiles.delete(tile);
          tile.style.visibility = tile._terrainVisibility;
          delete tile._terrainVisibility;
        }
      });
      L.Layer.types.terrain.elevationWGSL = `
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
    }
  });

  // src/utils/traffic.js
  function vehicleOffsets(length, flow, velocity = speed) {
    const count = Math.round(length * flow / 3600 / velocity);
    return Array.from({ length: count }, (_, i) => (i + 0.5) * length / count);
  }
  function along(points, lengths, s) {
    let i = 1;
    while (i < lengths.length - 1 && lengths[i] < s) i++;
    const a = points[i - 1], b = points[i], d = lengths[i] - lengths[i - 1] || 1;
    const t = (s - lengths[i - 1]) / d;
    return { x: a[0] + (b[0] - a[0]) * t, y: (a[2] ?? 0) + ((b[2] ?? 0) - (a[2] ?? 0)) * t, z: a[1] + (b[1] - a[1]) * t, dx: (b[0] - a[0]) / d, dz: (b[1] - a[1]) / d };
  }
  function scheduledTrips(date, { timeZone, duration, services }) {
    const time = new Date(date);
    if (!Number.isFinite(time.getTime())) throw new Error("Invalid date");
    const clock = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23"
    });
    const parts2 = Object.fromEntries(clock.formatToParts(time).filter((p) => p.type !== "literal").map((p) => [p.type, Number(p.value)]));
    const minute = parts2.hour * 60 + parts2.minute + (parts2.second + time.getUTCMilliseconds() / 1e3) / 60;
    const weekday = new Date(Date.UTC(parts2.year, parts2.month - 1, parts2.day)).getUTCDay();
    const minutes = (clockTime) => clockTime.split(":").reduce((hours, value) => hours * 60 + Number(value));
    const departures = [];
    for (const { from, to, every = Infinity, months, weekdays } of services) {
      if (months?.includes(parts2.month) === false || weekdays?.includes(weekday) === false) continue;
      for (let departure = minutes(from); departure <= minutes(to); departure += every) departures.push(departure);
    }
    return departures.sort((a, b) => a - b).filter((departure) => minute >= departure && minute < departure + duration).map((departure) => ({
      id: `${parts2.year}-${parts2.month}-${parts2.day}-${departure}`,
      departure: `${String(Math.floor(departure / 60)).padStart(2, "0")}:${String(departure % 60).padStart(2, "0")}`,
      progress: (minute - departure) / duration
    }));
  }
  function routeGeometry(lanes) {
    const position = [], normal = [], color = [];
    for (const { points, lengths } of lanes) for (let i = 1; i < points.length; i++) {
      const a = points[i - 1], b = points[i];
      const dx = b[0] - a[0], dz = b[1] - a[1], length = lengths[i] - lengths[i - 1];
      if (!length) continue;
      const x = -dz / length * 2.5, z = dx / length * 2.5;
      for (let distance = Math.floor(lengths[i - 1] / 30) * 30; distance < lengths[i]; distance += 30) {
        const start = Math.max(0, (distance - lengths[i - 1]) / length);
        const end = Math.min(1, (distance + 18 - lengths[i - 1]) / length);
        if (end <= start) continue;
        const p = [a[0] + dx * start, a[1] + dz * start], q = [a[0] + dx * end, a[1] + dz * end], y = a[2] + 0.4;
        for (const point of [
          [p[0] - x, p[1] - z],
          [p[0] + x, p[1] + z],
          [q[0] + x, q[1] + z],
          [p[0] - x, p[1] - z],
          [q[0] + x, q[1] + z],
          [q[0] - x, q[1] - z]
        ]) {
          position.push(point[0], y, point[1]);
          normal.push(0, 1, 0);
          color.push(0.08, 0.7, 0.85);
        }
      }
    }
    return { position, normal, color };
  }
  var speed, toLanes, tripsAt;
  var init_traffic = __esm({
    "src/utils/traffic.js"() {
      speed = 8;
      toLanes = ({ features = [] }) => features.flatMap(({ geometry, properties }) => {
        const lines = geometry?.type === "LineString" ? [geometry.coordinates] : geometry?.type === "MultiLineString" ? geometry.coordinates : [];
        return lines.map((line) => ({ latlngs: line.map(([lng, lat]) => [lat, lng]), properties: properties ?? {}, elevation: properties?.elevation }));
      });
      tripsAt = (time, lanes, velocity) => lanes.flatMap((lane, l) => {
        const { timetable, flow = 0 } = lane.properties;
        if (!lane.length) return [];
        if (timetable) return scheduledTrips(time, timetable).map((trip) => ({
          id: `${l}-${trip.id}`,
          lane,
          distance: trip.progress * lane.length,
          speed: lane.length / (timetable.duration * 60),
          properties: { ...lane.properties, departure: trip.departure }
        }));
        const travelled = time / 1e3 * velocity;
        return (lane.offsets ||= vehicleOffsets(lane.length, flow, velocity)).map((offset, k) => ({ id: `${l}-${k}`, lane, distance: (offset + travelled) % lane.length, speed: velocity, properties: lane.properties }));
      });
    }
  });

  // src/utils/vehicles.js
  var paints, box, mirror, glass, tyre, headlight, taillight, car, white, hull, boat, build, vehicles;
  var init_vehicles = __esm({
    "src/utils/vehicles.js"() {
      paints = [[0.86, 0.86, 0.88], [0.1, 0.1, 0.12], [0.5, 0.53, 0.57], [0.65, 0.1, 0.08], [0.12, 0.25, 0.55], [0.85, 0.7, 0.15]];
      box = (x0, x1, z0, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
      mirror = (x0, x1, z0, z1, ...rest) => [[box(x0, x1, z0, z1), ...rest], [box(-x1, -x0, z0, z1), ...rest]];
      glass = [0.12, 0.15, 0.18];
      tyre = [0.05, 0.05, 0.05];
      headlight = [1.9, 1.85, 1.7];
      taillight = [1.7, 0.06, 0.05];
      car = (i) => {
        const paint = paints[i % paints.length];
        return [
          ...mirror(0.7, 0.92, -1.68, -1.02, 0, 0.64, tyre),
          ...mirror(0.7, 0.92, 1.02, 1.68, 0, 0.64, tyre),
          [
            [[-0.9, -1.95], [-0.72, -2.25], [0.72, -2.25], [0.9, -1.95], [0.9, 2.05], [0.76, 2.25], [-0.76, 2.25], [-0.9, 2.05]],
            0.28,
            0.82,
            paint
          ],
          // Greenhouse: the windscreen leans back, the rear window less.
          [box(-0.84, 0.84, -0.75, 1.6), 0.82, 1.38, glass, box(-0.7, 0.7, -0.05, 1.3)],
          [box(-0.71, 0.71, -0.06, 1.31), 1.38, 1.46, paint],
          ...mirror(0.38, 0.8, -2.3, -2.16, 0.56, 0.76, headlight),
          [box(-0.78, 0.78, 2.16, 2.3), 0.6, 0.76, taillight]
        ];
      };
      white = [0.92, 0.93, 0.92];
      hull = [[-5.5, 30], [5.5, 30], [5.5, -20], [4, -26], [1.5, -30], [-1.5, -30], [-4, -26], [-5.5, -20]];
      boat = () => [
        [hull, 0, 0.8, [0.1, 0.16, 0.26]],
        [hull, 0.8, 1.4, white],
        [box(-5, 5, -18, 26), 1.4, 3.7, glass, box(-4.6, 4.6, -17.4, 25.6)],
        ...mirror(4.64, 4.74, -17, 25, 3.25, 3.45, [1.6, 1.25, 0.8]),
        [box(-4.8, 4.8, -17.8, 25.8), 3.7, 3.9, white],
        ...Array.from({ length: 12 }, (_, i) => mirror(0.5, 3.8, -12 + i * 3, -11.3 + i * 3, 3.9, 4.4, [0.62, 0.1, 0.1])).flat(),
        ...mirror(4.65, 4.8, -13.6, 25.8, 3.9, 4.8, white),
        [box(-4.8, 4.8, 25.65, 25.8), 3.9, 4.8, white],
        [box(-2.2, 2.2, -17.6, -14), 3.9, 4.7, white],
        [box(-2.2, 2.2, -17.6, -14), 4.7, 5.5, glass],
        [box(-2.5, 2.5, -18, -13.6), 5.5, 5.7, white],
        [box(-2.45, -2.2, -16.2, -15.8), 5, 5.3, [2, 0.15, 0.1]],
        [box(2.2, 2.45, -16.2, -15.8), 5, 5.3, [0.1, 2, 0.4]],
        [box(-0.1, 0.1, -15.9, -15.7), 5.7, 6.6, white],
        [box(-0.15, 0.15, -15.95, -15.65), 6.6, 6.8, [2, 2, 1.9]]
      ];
      build = (parts2) => {
        const position = [], normal = [], color = [];
        const triangle = (a, b, c, tint) => {
          const u = b.map((v2, i) => v2 - a[i]), v = c.map((w, i) => w - a[i]);
          const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]], length = Math.hypot(...n);
          for (const point of [a, b, c]) {
            position.push(...point);
            normal.push(...n.map((w) => w / length));
            color.push(...tint);
          }
        };
        for (const [ring, bottom, top, tint, topRing = ring] of parts2) {
          const low = ring.map(([x, z]) => [x, bottom, z]), high = topRing.map(([x, z]) => [x, top, z]);
          for (let i = 0; i < ring.length; i++) {
            const j = (i + 1) % ring.length;
            triangle(low[i], low[j], high[j], tint);
            triangle(low[i], high[j], high[i], tint);
          }
          for (let i = 1; i < ring.length - 1; i++) {
            triangle(high[0], high[i], high[i + 1], tint);
            triangle(low[0], low[i + 1], low[i], tint);
          }
        }
        return { position, normal, color };
      };
      vehicles = {
        car: { side: 1.8, model: car, lights: [{ position: [0, 1.2, -6], radius: 10, color: [1, 0.94, 0.82], flux: 800 }] },
        boat: { side: 0, model: boat, lights: [{ position: [0, 8, 4], radius: 30, color: [1, 0.8, 0.55], flux: 2e4 }] }
      };
    }
  });

  // src/types/traffic.js
  var traffic_exports = {};
  function installTraffic(layer, { url, model, lights, side, outline, velocity }) {
    const L2 = globalThis.L;
    const now = () => {
      let control = { live: true };
      layer._map?.eachLayer((other) => {
        if (other.control?.time) control = other.control;
      });
      return { live: control.live, time: control.live ? /* @__PURE__ */ new Date() : control.time };
    };
    const status = L2.DomUtil.create("small", "traffic-status");
    status.style.cssText = "display:block;max-width:200px;margin:0 0 4px 20px;color:#555;";
    const template = build(model(0)), stride = template.position.length, vertices = stride / 3;
    let ready = false, frame, request, lanes = [], tripsKey, mesh, route2, litAt = -Infinity;
    let trips = [], rebasedAt = 0, nextCheck = -Infinity, elapsed = 0, gpu = null, lanesDirty = true, stale = false;
    const params = new ArrayBuffer(16), paramFloats = new Float32Array(params), paramInts = new Uint32Array(params);
    const createMesh2 = (data, featureFaces, material, usage = 0) => {
      const result = layer._createMesh(data, material, usage);
      result.extras.featureFaces = featureFaces;
      return result;
    };
    const dispose = (object) => {
      if (!object) return;
      if (layer.highlightedFeature?.mesh === object) {
        layer._setHighlight(null);
        layer.hoveredFeature = null;
        layer._showFeature(null);
      }
      layer._disposeMesh(object);
    };
    const fail = (error) => {
      status.textContent = `Error: ${error.message}`;
      status.setAttribute("role", "alert");
      console.error("Traffic layer", error);
    };
    const ground = () => {
      const terrain2 = layer._map._terrain3D?._terrainReady && layer._map._terrain3D, base = layer.root.position[1];
      for (const lane of lanes) lane.points.forEach((point, i) => {
        const elevation = terrain2 && (lane.elevation ?? terrain2._getElevation(lane.latlngs[i]));
        point[2] = Number.isFinite(elevation) && Number.isFinite(base) ? elevation - base : 0;
      });
      lanesDirty = true;
      nextCheck = -Infinity;
    };
    const prepare = () => {
      const crs = layer._map.options.crs, origin = crs.project(layer.location);
      const metres = Math.cos(layer.location.lat * Math.PI / 180);
      for (const lane of lanes) {
        lane.points = lane.latlngs.map(([lat, lng]) => {
          const point = crs.project(new L2.LatLng(lat, lng));
          return [(point.x - origin.x) * metres, -(point.y - origin.y) * metres, 0];
        });
        lane.lengths = [0];
        for (let i = 1; i < lane.points.length; i++) {
          lane.lengths.push(lane.lengths[i - 1] + Math.hypot(lane.points[i][0] - lane.points[i - 1][0], lane.points[i][1] - lane.points[i - 1][1]));
        }
        lane.length = lane.lengths.at(-1);
      }
      ground();
      dispose(route2);
      route2 = null;
      tripsKey = null;
    };
    const drawRoute = () => {
      route2 = createMesh2(routeGeometry(lanes), [], { emissive: [0.03, 0.25, 0.3], alphaMode: "BLEND" });
      route2.renderOrder = 1e3;
    };
    const rebuild = () => {
      dispose(mesh);
      mesh = null;
      if (!trips.length) return;
      const color = trips.flatMap((trip, i) => build(model(i)).color), count = color.length / 3;
      mesh = createMesh2(
        { position: color.map(() => 0), normal: color.map(() => 0), color },
        trips.map((trip, i) => ({
          id: trip.id,
          properties: trip.properties,
          faceStart: i * vertices / 3,
          faceEnd: (i + 1) * vertices / 3,
          vertexStart: i * vertices,
          vertexEnd: (i + 1) * vertices
        })),
        {},
        GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
      );
      mesh.geometry.drawRange.count = count;
      bounds();
    };
    const bounds = () => {
      const extent = { attributes: { position: { data: lanes.flatMap((lane) => lane.points.flatMap(([x, z, y]) => [x - 20, y, z - 20, x + 20, y + 5, z + 20])) } } };
      computeBounds(extent);
      mesh.geometry.bounds = extent.bounds;
    };
    const destroyGpu = () => {
      for (const buffer of [gpu?.params, gpu?.template, gpu?.points, gpu?.vehicles]) buffer?.destroy();
      gpu = null;
    };
    const storage = (device, data) => {
      const buffer = device.createBuffer({ size: Math.max(16, data.byteLength), usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
      device.queue.writeBuffer(buffer, 0, data);
      return buffer;
    };
    const shader = `
    struct Params { seconds: f32, side: f32, vertices: u32, total: u32 }
    struct Vehicle { start: u32, count: u32, base: f32, speed: f32 }
    @group(0) @binding(0) var<uniform> params: Params;
    @group(0) @binding(1) var<storage, read> model: array<f32>;
    @group(0) @binding(2) var<storage, read> points: array<vec4f>;
    @group(0) @binding(3) var<storage, read> vehicles: array<Vehicle>;
    @group(0) @binding(4) var<storage, read_write> position: array<f32>;
    @group(0) @binding(5) var<storage, read_write> normal: array<f32>;
    @compute @workgroup_size(64)
    fn main(@builtin(global_invocation_id) id: vec3u) {
      let v = id.x;
      if (v >= params.total) { return; }
      let vehicle = vehicles[v / params.vertices];
      let last = vehicle.start + vehicle.count - 1u;
      let length = points[last].w;
      var s = vehicle.base + params.seconds * vehicle.speed;
      s -= length * floor(s / length);
      var i = vehicle.start + 1u;
      while (i < last && points[i].w < s) { i++; }
      let a = points[i - 1u];
      let b = points[i];
      let d = select(b.w - a.w, 1.0, b.w == a.w);
      let t = (s - a.w) / d;
      let dx = (b.x - a.x) / d;
      let dz = (b.y - a.y) / d;
      let cx = a.x + (b.x - a.x) * t - dz * params.side;
      let cz = a.y + (b.y - a.y) * t + dx * params.side;
      let y = a.z + (b.z - a.z) * t;
      let k = (v % params.vertices) * 3u;
      let n = params.vertices * 3u + k;
      let o = v * 3u;
      position[o] = cx - model[k] * dz - model[k + 2u] * dx;
      position[o + 1u] = y + model[k + 1u];
      position[o + 2u] = cz + model[k] * dx - model[k + 2u] * dz;
      normal[o] = -model[n] * dz - model[n + 2u] * dx;
      normal[o + 1u] = model[n + 1u];
      normal[o + 2u] = model[n] * dx - model[n + 2u] * dz;
    }`;
    const rebase = () => {
      const { device } = layer.renderer;
      if (gpu?.device !== device) {
        destroyGpu();
        gpu = {
          device,
          pipeline: device.createComputePipeline({ layout: "auto", compute: { module: device.createShaderModule({ code: shader }), entryPoint: "main" } }),
          params: device.createBuffer({ size: 16, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST }),
          template: storage(device, new Float32Array([...template.position, ...template.normal]))
        };
        lanesDirty = true;
      }
      if (lanesDirty) {
        const data2 = new Float32Array(lanes.reduce((count, lane) => count + lane.points.length, 0) * 4);
        let offset = 0;
        for (const lane of lanes) {
          lane.start = offset / 4;
          lane.points.forEach((point, i) => {
            data2.set([point[0], point[1], point[2], lane.lengths[i]], offset);
            offset += 4;
          });
        }
        gpu.points?.destroy();
        gpu.points = storage(device, data2);
        lanesDirty = false;
      }
      const data = new Float32Array(trips.length * 4), index = new Uint32Array(data.buffer);
      trips.forEach((trip, i) => {
        index[i * 4] = trip.lane.start;
        index[i * 4 + 1] = trip.lane.points.length;
        data[i * 4 + 2] = trip.distance;
        data[i * 4 + 3] = trip.speed;
        mesh.extras.featureFaces[i].properties = trip.properties;
      });
      if (gpu.vehicles?.size >= data.byteLength) device.queue.writeBuffer(gpu.vehicles, 0, data);
      else {
        gpu.vehicles?.destroy();
        gpu.vehicles = storage(device, data);
      }
      const { position, normal } = mesh.geometry.attributes;
      gpu.bindGroup = device.createBindGroup({
        layout: gpu.pipeline.getBindGroupLayout(0),
        entries: [gpu.params, gpu.template, gpu.points, gpu.vehicles, position.buffer, normal.buffer].map((buffer, binding) => ({ binding, resource: { buffer } }))
      });
    };
    const move = (seconds) => {
      const { device } = gpu;
      paramFloats[0] = elapsed = seconds;
      paramFloats[1] = side;
      paramInts[2] = vertices;
      paramInts[3] = trips.length * vertices;
      device.queue.writeBuffer(gpu.params, 0, params);
      const encoder = device.createCommandEncoder(), pass = encoder.beginComputePass();
      pass.setPipeline(gpu.pipeline);
      pass.setBindGroup(0, gpu.bindGroup);
      pass.dispatchWorkgroups(Math.ceil(paramInts[3] / 64));
      pass.end();
      device.queue.submit([encoder.finish()]);
      stale = true;
    };
    const locate = (trip) => {
      const { points, lengths, length } = trip.lane;
      let distance = trip.distance + elapsed * trip.speed;
      distance -= length * Math.floor(distance / length);
      const { x, y, z, dx, dz } = along(points, lengths, distance);
      return { x: x - dz * side, y, z: z + dx * side, dx, dz };
    };
    const place = () => {
      if (!mesh || !stale) return;
      stale = false;
      const { position, normal } = mesh.geometry.attributes;
      trips.forEach((trip, i) => {
        const { x: cx, y, z: cz, dx, dz } = locate(trip);
        for (let k = 0, o = i * stride; k < stride; k += 3, o += 3) {
          const lx = template.position[k], lz = template.position[k + 2], nx = template.normal[k], nz = template.normal[k + 2];
          position.data[o] = cx - lx * dz - lz * dx;
          position.data[o + 1] = y + template.position[k + 1];
          position.data[o + 2] = cz + lx * dx - lz * dz;
          normal.data[o] = -nx * dz - nz * dx;
          normal.data[o + 1] = template.normal[k + 1];
          normal.data[o + 2] = nx * dx - nz * dz;
        }
      });
    };
    const raycast2 = layer.raycast;
    layer.raycast = function(...args) {
      place();
      return raycast2.apply(this, args);
    };
    const tick = () => {
      frame = void 0;
      if (!ready || !layer._map) return;
      if (!layer.renderer) {
        frame = requestAnimationFrame(tick);
        return;
      }
      if (mesh && !(mesh.geometry.attributes.position.buffer.usage & GPUBufferUsage.STORAGE)) {
        tripsKey = null;
        nextCheck = -Infinity;
      }
      const { live, time } = now(), ms = time?.getTime(), valid = Number.isFinite(ms);
      let changed = false;
      if (!live || !valid || !(ms >= rebasedAt && ms < nextCheck)) {
        let text;
        try {
          trips = valid ? tripsAt(time, lanes, velocity) : [];
          text = !valid ? "Select a valid simulation date" : !loaded ? "Loading\u2026" : `${trips.length} vehicle${trips.length === 1 ? "" : "s"}${loaded.note ? ` \xB7 ${loaded.note}` : ""}`;
        } catch (error) {
          return fail(error);
        }
        rebasedAt = ms;
        nextCheck = ms + 1e3;
        const key = trips.map((trip) => trip.id).join();
        changed = key !== tripsKey || outline && !route2 && lanes.length;
        if (outline && !route2 && lanes.length) drawRoute();
        if (key !== tripsKey) {
          rebuild();
          tripsKey = key;
        }
        if (mesh) rebase();
        if (status.textContent !== text) status.textContent = text;
        status.removeAttribute("role");
      }
      if (mesh) move((ms - rebasedAt) / 1e3);
      if (mesh && lights && (!live || !(performance.now() - litAt < 100))) {
        litAt = performance.now();
        mesh.extras.lights = trips.flatMap((trip) => {
          const { x, y, z, dx, dz } = locate(trip);
          return lights.map(({ position: [lx, ly, lz], ...light }) => ({ ...light, position: [x - lx * dz - lz * dx, y + ly, z + lx * dx - lz * dz] }));
        });
      }
      if (mesh || changed) layer.update();
      if (live && valid) frame = requestAnimationFrame(tick);
    };
    let loaded, file;
    const fetchLanes = async (time, signal) => {
      const href = new URL(url, document.baseURI).href;
      if (/\.m?js(?:[?#]|$)/i.test(url)) return (await import(href)).default(time, layer, signal);
      if (!file) {
        const response = await fetch(href, { signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        file = await response.json();
      }
      return file;
    };
    const load = () => {
      const { time } = now();
      if (!Number.isFinite(time?.getTime())) return;
      request?.abort();
      const { signal } = request = new AbortController();
      fetchLanes(time, signal).then((data) => {
        if (signal.aborted || !layer._map || data === loaded) return;
        loaded = data;
        lanes = toLanes(data);
        prepare();
        if (!frame) tick();
      }, (error) => {
        if (error.name !== "AbortError") fail(error);
      });
    };
    const update2 = (event) => {
      if (event?.layer === layer) return;
      cancelAnimationFrame(frame);
      load();
      tick();
    };
    const terrain = () => {
      if (!lanes.length) return;
      ground();
      dispose(route2);
      route2 = null;
      if (mesh) bounds();
      if (!frame) tick();
    };
    const start = () => {
      layer._map.off("simulationtimechange layerremove", update2).on("simulationtimechange layerremove", update2);
      layer._map.off("terrainchange", terrain).on("terrainchange", terrain);
      underEntry(layer, status);
      update2();
    };
    layer.on("ready", () => {
      ready = true;
      if (layer._map) start();
    });
    layer.on("add", () => {
      if (ready) start();
    });
    layer.on("remove", () => {
      request?.abort();
      cancelAnimationFrame(frame);
      frame = void 0;
      layer._map.off("simulationtimechange layerremove", update2).off("terrainchange", terrain);
      dispose(mesh);
      dispose(route2);
      mesh = route2 = null;
      destroyGpu();
      lanes = [];
      trips = [];
      tripsKey = loaded = null;
    });
  }
  var tooltip;
  var init_traffic2 = __esm({
    "src/types/traffic.js"() {
      init_d();
      init_geometry();
      init_traffic();
      init_vehicles();
      init_control();
      tooltip = ({ properties: p }) => {
        const content = document.createElement("div");
        content.style.whiteSpace = "pre-line";
        content.textContent = [p.name, p.departure && `Departure ${p.departure} ${p.timetable.timeZone}`, p.description].filter(Boolean).join("\n");
        return content;
      };
      L.Layer.types.traffic = L.Layer.types["3d"].extend({
        initialize({ url, vehicle = "car", side, outline = false, speed: velocity = speed, ...options } = {}) {
          if (!url) throw new Error("Traffic needs a source url");
          if (!vehicles[vehicle]) throw new Error(`Unknown vehicle: ${vehicle}`);
          L.Layer.types["3d"].prototype.initialize.call(this, { tooltipContent: tooltip, nightLight: Boolean(vehicles[vehicle].lights), ...options });
          installTraffic(this, { url, ...vehicles[vehicle], side: side ?? vehicles[vehicle].side, outline, velocity });
        }
      });
    }
  });

  // src/utils/walk.js
  function collider(mesh) {
    let c = colliders.get(mesh.geometry);
    if (c) return c;
    const m = mesh.worldMatrix, { position: { data: p }, index, normal, uv } = mesh.geometry.attributes;
    const count = index ? index.count : p.length / 3, tri = [], nrm = [], cells = /* @__PURE__ */ new Map(), v = [];
    for (let i = 0; i < count; i += 3) {
      const first = index ? index.data[i] : i;
      if (mesh.program.nightLight && uv && uv.data[first * 2] <= 2) continue;
      for (let k = 0; k < 3; k++) {
        const j = (index ? index.data[i + k] : i + k) * 3, x = p[j], y = p[j + 1], z = p[j + 2];
        v[k * 3] = m[0] * x + m[4] * y + m[8] * z + m[12];
        v[k * 3 + 1] = m[1] * x + m[5] * y + m[9] * z + m[13];
        v[k * 3 + 2] = m[2] * x + m[6] * y + m[10] * z + m[14];
      }
      const ex = v[3] - v[0], ey = v[4] - v[1], ez = v[5] - v[2], fx = v[6] - v[0], fy = v[7] - v[1], fz = v[8] - v[2];
      let nx = ey * fz - ez * fy, nz = ex * fy - ey * fx;
      const ny = ez * fx - ex * fz, length = Math.hypot(nx, ny, nz);
      if (!length || Math.abs(ny) > 0.9 * length) continue;
      if (normal) {
        const j = first * 3, a = normal.data;
        if ((m[0] * a[j] + m[4] * a[j + 1] + m[8] * a[j + 2]) * nx + (m[2] * a[j] + m[6] * a[j + 1] + m[10] * a[j + 2]) * nz < 0) {
          nx = -nx;
          nz = -nz;
        }
      }
      const h = Math.hypot(nx, nz), t = nrm.length / 2;
      tri.push(...v);
      nrm.push(nx / h, nz / h);
      for (let ix = Math.floor(Math.min(v[0], v[3], v[6]) / CELL); ix <= Math.floor(Math.max(v[0], v[3], v[6]) / CELL); ix++)
        for (let iz = Math.floor(Math.min(v[2], v[5], v[8]) / CELL); iz <= Math.floor(Math.max(v[2], v[5], v[8]) / CELL); iz++) {
          const key = ix + "," + iz;
          if (!cells.has(key)) cells.set(key, []);
          cells.get(key).push(t);
        }
    }
    c = { tri: Float32Array.from(tri), nrm: Float32Array.from(nrm), cells, origin: [m[12], m[13], m[14]] };
    colliders.set(mesh.geometry, c);
    return c;
  }
  function horizontalRay(v, t, ox, oy, oz, dx, dz) {
    const i = t * 9, ex = v[i + 3] - v[i], ey = v[i + 4] - v[i + 1], ez = v[i + 5] - v[i + 2];
    const fx = v[i + 6] - v[i], fy = v[i + 7] - v[i + 1], fz = v[i + 8] - v[i + 2];
    const px = -dz * fy, py = dz * fx - dx * fz, pz = dx * fy, det = ex * px + ey * py + ez * pz;
    if (Math.abs(det) < 1e-9) return -1;
    const tx = ox - v[i], ty = oy - v[i + 1], tz = oz - v[i + 2], u = (tx * px + ty * py + tz * pz) / det;
    if (u < 0 || u > 1) return -1;
    const qx = ty * ez - tz * ey, qy = tz * ex - tx * ez, qz = tx * ey - ty * ex, w = (dx * qx + dz * qz) / det;
    if (w < 0 || u + w > 1) return -1;
    return (fx * qx + fy * qy + fz * qz) / det;
  }
  var skin, shirt, trousers, dark, parts, limbs, CELL, colliders;
  var init_walk = __esm({
    "src/utils/walk.js"() {
      init_vehicles();
      skin = [0.85, 0.64, 0.5];
      shirt = [0.75, 0.2, 0.15];
      trousers = [0.16, 0.2, 0.32];
      dark = [0.08, 0.07, 0.06];
      parts = {
        body: [
          [box(-0.17, 0.17, -0.1, 0.1), 0.82, 0.95, trousers],
          [box(-0.19, 0.19, -0.11, 0.11), 0.95, 1.44, shirt],
          [box(-0.05, 0.05, -0.05, 0.05), 1.44, 1.5, skin],
          [box(-0.1, 0.1, -0.11, 0.1), 1.5, 1.72, skin],
          [box(-0.105, 0.105, -0.06, 0.115), 1.58, 1.77, dark],
          [box(-0.105, 0.105, -0.115, -0.06), 1.7, 1.77, dark]
        ],
        leg: [[box(-0.07, 0.07, -0.07, 0.07), -0.82, 0, trousers], [box(-0.07, 0.07, -0.17, 0.07), -0.9, -0.82, dark]],
        arm: [[box(-0.05, 0.05, -0.05, 0.05), -0.55, 0, shirt], [box(-0.045, 0.045, -0.045, 0.045), -0.66, -0.55, skin]]
      };
      limbs = [["body", 0, 0, 0], ["leg", -0.09, 0.9, 1], ["leg", 0.09, 0.9, -1], ["arm", -0.25, 1.42, -1], ["arm", 0.25, 1.42, 1]];
      CELL = 8;
      colliders = /* @__PURE__ */ new WeakMap();
    }
  });

  // src/types/walk.js
  var walk_exports = {};
  function hit(layer, x, y, z, dx, dz, reach) {
    const types2 = globalThis.L.Layer.types, skip = (other) => other === layer || ["terrain", "traffic"].some((name) => types2[name] && other instanceof types2[name]);
    updateWorldMatrix(layer.scene);
    let best = reach, found = null;
    for (const other of layer._shared._layers) {
      if (skip(other)) continue;
      traverse(other.root, (mesh) => {
        if (!mesh.visible) return true;
        if (!mesh.geometry?.attributes?.position?.data || mesh.program?.depthTest === false) return;
        if (!mesh.geometry.bounds) computeBounds(mesh.geometry);
        const m = mesh.worldMatrix, { center: k, radius } = mesh.geometry.bounds;
        if (Math.hypot(m[0] * k[0] + m[4] * k[1] + m[8] * k[2] + m[12] - x, m[2] * k[0] + m[6] * k[1] + m[10] * k[2] + m[14] - z) > radius * Math.hypot(m[0], m[1], m[2]) + reach) return;
        const c = collider(mesh), ox = x - m[12] + c.origin[0], oy = y - m[13] + c.origin[1], oz = z - m[14] + c.origin[2];
        const seen = /* @__PURE__ */ new Set();
        for (let ix = Math.floor(Math.min(ox, ox + dx * reach) / CELL); ix <= Math.floor(Math.max(ox, ox + dx * reach) / CELL); ix++)
          for (let iz = Math.floor(Math.min(oz, oz + dz * reach) / CELL); iz <= Math.floor(Math.max(oz, oz + dz * reach) / CELL); iz++)
            for (const t of c.cells.get(ix + "," + iz) || []) {
              if (seen.has(t) || dx * c.nrm[t * 2] + dz * c.nrm[t * 2 + 1] >= 0) continue;
              seen.add(t);
              for (const height of [0.4, 1.5]) {
                const d = horizontalRay(c.tri, t, ox, oy + height, oz, dx, dz);
                if (d >= 0 && d < best) {
                  best = d;
                  found = [c.nrm[t * 2], c.nrm[t * 2 + 1]];
                }
              }
            }
      });
    }
    return found;
  }
  function installWalk(layer, { speed: speed2, distance, position }) {
    const L2 = globalThis.L, keys = /* @__PURE__ */ new Set();
    const control = new L2.Control({ position });
    const container = L2.DomUtil.create("div", "leaflet-bar leaflet-control");
    container.style.cssText = "display:flex;align-items:center;background:#fff;";
    const button = L2.DomUtil.create("button", "", container);
    button.type = "button";
    button.title = "Walk";
    button.setAttribute("aria-label", "Walk");
    button.setAttribute("aria-pressed", "false");
    button.textContent = "\u{1F6B6}";
    button.style.cssText = "width:30px;height:30px;padding:0;border:0;border-radius:4px;background:#fff;font-size:18px;line-height:30px;cursor:pointer;";
    const hint = L2.DomUtil.create("small", "", container);
    hint.style.cssText = "display:none;padding:0 8px;color:#333;white-space:nowrap;";
    hint.textContent = "W/S: run \xB7 A/D: turn \xB7 drag: look around \xB7 Esc: exit";
    L2.DomEvent.disableClickPropagation(container);
    control.onAdd = () => container;
    let meshes, frame, last, swing = 0, saved, drag;
    const state = layer.walker = { latlng: null, heading: 0, phase: 0 };
    const local = () => {
      const map = layer._map, crs = map.options.crs, origin = crs.project(layer.location), metres = Math.cos(layer.location.lat * Math.PI / 180);
      const p = crs.project(state.latlng), terrain = map._terrain3D?._terrainReady && map._terrain3D;
      const ground = terrain && terrain._getElevation(state.latlng) || 0;
      return [(p.x - origin.x) * metres, ground - layer.root.position[1], -(p.y - origin.y) * metres];
    };
    const place = () => {
      const [x, y, z] = local();
      const yaw = -state.heading, cos = Math.cos(yaw), sin = Math.sin(yaw);
      limbs.forEach(([, px, py, sign], i) => {
        const mesh = meshes[i];
        mesh.position[0] = x + px * cos;
        mesh.position[1] = y + py;
        mesh.position[2] = z - px * sin;
        mesh.rotation[0] = sign * swing * Math.sin(state.phase);
        mesh.rotation[1] = yaw;
      });
      layer.update();
    };
    const step = (now) => {
      frame = requestAnimationFrame(step);
      const map = layer._map, dt = Math.min(0.1, (now - (last ?? now)) / 1e3);
      last = now;
      if (!layer.renderer) return;
      let changed = false;
      if (!meshes) {
        meshes = limbs.map(([part]) => layer._createMesh(build(parts[part])));
        changed = true;
      }
      let forward = 0, turn = 0;
      for (const key of keys) {
        forward += moves[key]?.[0] || 0;
        turn += moves[key]?.[1] || 0;
      }
      forward = Math.sign(forward);
      turn = Math.sign(turn);
      if (turn) {
        state.heading = wrap(state.heading + turn * 2.5 * dt);
        changed = true;
      }
      if (forward) {
        const metres = forward * speed2 * dt, { lat, lng } = state.latlng, { position: position2, scale } = layer.root;
        let east = Math.sin(state.heading) * metres, north = Math.cos(state.heading) * metres;
        const feet = local().map((value, i) => position2[i] + scale[i] * value);
        const blocked = () => {
          const length = Math.hypot(east, north);
          return length > 1e-6 && hit(layer, feet[0], feet[1], feet[2], east / length, -north / length, length + 0.3);
        };
        const wall = blocked();
        if (wall) {
          const into = east * wall[0] - north * wall[1];
          east -= into * wall[0];
          north += into * wall[1];
          if (blocked()) east = north = 0;
        }
        state.latlng = new L2.LatLng(lat + north / 111320, lng + east / (111320 * Math.cos(lat * Math.PI / 180)));
        state.phase += Math.hypot(east, north) / 1.6 * Math.PI;
        changed = true;
      }
      if (forward || turn) {
        const bearing = map.getBearing() * Math.PI / 180, behind = wrap(-state.heading - bearing);
        if (Math.abs(behind) > 1e-3) map._setPitchAndBearing(map.getPitch(), (bearing + behind * Math.min(1, dt * 4)) * 180 / Math.PI);
        map.setView(state.latlng, map.getZoom(), { animate: false });
      }
      const target = forward ? 0.9 : 0;
      if (Math.abs(swing - target) > 1e-3) {
        swing += (target - swing) * Math.min(1, dt * 10);
        changed = true;
      }
      if (changed) place();
    };
    const onKey = (event) => {
      if (event.target.closest?.("input:not([type=checkbox], [type=radio]), select, textarea, [contenteditable]") || event.ctrlKey || event.altKey || event.metaKey) return;
      if (event.type === "keydown" && event.code === "Escape") {
        stop();
        return;
      }
      if (!moves[event.code]) return;
      event.preventDefault();
      if (event.type === "keydown") keys.add(event.code);
      else keys.delete(event.code);
    };
    const onBlur = () => keys.clear();
    const onPointer = (event) => {
      const map = layer._map;
      if (event.type === "pointerdown") {
        if (event.button !== 0 || event.target.closest(".leaflet-control")) return;
        drag = { x: event.clientX, y: event.clientY };
        map.getContainer().setPointerCapture(event.pointerId);
      } else if (drag && event.type === "pointermove") {
        map._setPitchAndBearing(
          Math.max(20, Math.min(85, map.getPitch() - (event.clientY - drag.y) * 0.2)),
          map.getBearing() - (event.clientX - drag.x) * 0.25
        );
        drag = { x: event.clientX, y: event.clientY };
      } else drag = null;
    };
    const onTerrain = () => {
      if (meshes) place();
    };
    const start = () => {
      const map = layer._map;
      if (saved || !map) return;
      state.latlng = map.getCenter();
      const pixelsPerMetre = map.getSize().y * 1.5 / distance;
      const zoom = Math.min(map.getMaxZoom(), Math.log2(pixelsPerMetre * 4007501668557849e-8 * Math.cos(state.latlng.lat * Math.PI / 180) / 256));
      saved = {
        zoom: map.getZoom(),
        pitch: map.getPitch(),
        scrollWheelZoom: map.options.scrollWheelZoom,
        handlers: ["dragging", "keyboard", "doubleClickZoom", "boxZoom"].filter((name) => map[name]?.enabled())
      };
      for (const name of saved.handlers) map[name].disable();
      map.options.scrollWheelZoom = saved.scrollWheelZoom && "center";
      state.heading = -map.getBearing() * Math.PI / 180;
      map.setView(state.latlng, zoom, { animate: false });
      map.setPitch(75);
      L2.DomEvent.on(document, "keydown keyup", onKey);
      L2.DomEvent.on(window, "blur", onBlur);
      L2.DomEvent.on(map.getContainer(), "pointerdown pointermove pointerup pointercancel", onPointer);
      map.on("terrainchange", onTerrain);
      button.setAttribute("aria-pressed", "true");
      button.style.background = "#e4e4e4";
      hint.style.display = "";
      last = void 0;
      frame = requestAnimationFrame(step);
    };
    const stop = () => {
      const map = layer._map;
      cancelAnimationFrame(frame);
      keys.clear();
      drag = null;
      L2.DomEvent.off(document, "keydown keyup", onKey);
      L2.DomEvent.off(window, "blur", onBlur);
      for (const mesh of meshes || []) layer._disposeMesh(mesh);
      meshes = null;
      button.setAttribute("aria-pressed", "false");
      button.style.background = "#fff";
      hint.style.display = "none";
      if (!map || !saved) return;
      L2.DomEvent.off(map.getContainer(), "pointerdown pointermove pointerup pointercancel", onPointer);
      map.off("terrainchange", onTerrain);
      map.options.scrollWheelZoom = saved.scrollWheelZoom;
      for (const name of saved.handlers) map[name].enable();
      map.setView(state.latlng, saved.zoom, { animate: false });
      map.setPitch(saved.pitch);
      saved = null;
    };
    L2.DomEvent.on(button, "click", () => saved ? stop() : start());
    let ready = false;
    layer.on("ready", () => {
      ready = true;
      if (layer._map) control.addTo(layer._map);
    });
    layer.on("add", () => {
      if (ready) control.addTo(layer._map);
    });
    layer.on("remove", () => {
      stop();
      control.remove();
    });
  }
  var moves, wrap;
  var init_walk2 = __esm({
    "src/types/walk.js"() {
      init_walk();
      init_d();
      init_geometry();
      init_scene();
      init_vehicles();
      moves = { KeyW: [1, 0], ArrowUp: [1, 0], KeyS: [-1, 0], ArrowDown: [-1, 0], KeyD: [0, 1], ArrowRight: [0, 1], KeyA: [0, -1], ArrowLeft: [0, -1] };
      wrap = (angle) => Math.atan2(Math.sin(angle), Math.cos(angle));
      L.Layer.types.walk = L.Layer.types["3d"].extend({
        initialize({ speed: speed2 = 70, distance = 20, position = "bottomright", ...options } = {}) {
          L.Layer.types["3d"].prototype.initialize.call(this, options);
          installWalk(this, { speed: speed2, distance, position });
        }
      });
    }
  });

  // import("./types/**/*.js") in src/index.js
  var globImport_types_js = __glob({
    "./types/3d.js": () => Promise.resolve().then(() => (init_d(), d_exports)),
    "./types/pmtiles.js": () => Promise.resolve().then(() => (init_pmtiles3(), pmtiles_exports3)),
    "./types/sunlight.js": () => Promise.resolve().then(() => (init_sunlight(), sunlight_exports)),
    "./types/terrain.js": () => Promise.resolve().then(() => (init_terrain2(), terrain_exports)),
    "./types/traffic.js": () => Promise.resolve().then(() => (init_traffic2(), traffic_exports)),
    "./types/walk.js": () => Promise.resolve().then(() => (init_walk2(), walk_exports))
  });

  // src/index.js
  if (typeof L.Map.prototype.getPitch !== "function") {
    throw new Error("Load leaflet-rotate before leaflet-city-mapper");
  }
  var Pending = L.Layer.extend({
    onAdd() {
    },
    onRemove() {
    }
  });
  var loading = Promise.resolve();
  function become(layer, type, settings) {
    const Type = L.Layer.types[type];
    Object.setPrototypeOf(layer, Type.prototype);
    layer.options = Object.create(Type.prototype.options);
    return Type.prototype.initialize.call(layer, settings);
  }
  function route(layer, options) {
    const { source: { type = /\.pmtiles(?:[?#]|$)/i.test(options.source.url) ? "pmtiles" : "3d", ...source }, ...core } = options;
    const settings = { ...source, ...core };
    const map = layer._map;
    map?.removeLayer(layer);
    delete layer.onAdd;
    delete layer.onRemove;
    if (L.Layer.types[type]) {
      become(layer, type, settings);
      map?.addLayer(layer);
      return;
    }
    Object.setPrototypeOf(layer, Pending.prototype);
    L.Util.setOptions(layer, core);
    map?.addLayer(layer);
    loading = loading.catch(() => {
    }).then(() => globImport_types_js(`./types/${type}.js`));
    const pending = layer.ready = loading.then(() => {
      const map2 = layer._map;
      map2?.removeLayer(layer);
      become(layer, type, settings);
      map2?.addLayer(layer);
      return layer.ready === pending ? layer : layer.ready;
    });
  }
  L.Layer.types = {};
  L.Layer.include({
    initialize(options) {
      L.Util.setOptions(this, options);
    }
  });
  L.Layer.addInitHook(function() {
    const { options } = this;
    if (Object.getPrototypeOf(this) !== L.Layer.prototype || !options.source) return;
    route(this, options);
  });
})();
//# sourceMappingURL=leaflet-city-mapper-src.js.map
