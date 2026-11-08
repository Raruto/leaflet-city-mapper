(() => {
  // src/globals/geometryEmpty.js
  var geometryEmpty = [];

  // src/triangulation/minimumX.js
  function minimumX(ring3) {
    let minimum = Infinity;
    let point;
    for (point of ring3) minimum = Math.min(minimum, point.x);
    return minimum;
  }

  // src/triangulation/mergeHoles.js
  function mergeHoles(source, target, start, width) {
    const middle = Math.min(start + width, source.length), end = Math.min(start + width * 2, source.length);
    let left = start, right = middle, output;
    for (output = start; output < end; output++) {
      if (left < middle && (right >= end || source[left].x <= source[right].x)) {
        target[output] = source[left++];
      } else {
        target[output] = source[right++];
      }
    }
  }

  // src/triangulation/sortHoles.js
  function sortHoles(holes) {
    if (holes.length < 2) return holes;
    const buffer = (
      /* alloc */
      new Array(holes.length)
    );
    const entries = (
      /* alloc */
      []
    );
    let ring3, width, start, previous, i;
    for (ring3 of holes) entries.push(
      /* alloc */
      { ring: ring3, x: minimumX(ring3) }
    );
    let source = entries, target = buffer;
    for (width = 1; width < entries.length; width *= 2) {
      for (start = 0; start < entries.length; start += width * 2) {
        mergeHoles(source, target, start, width);
      }
      previous = source;
      source = target;
      target = previous;
    }
    for (i = 0; i < holes.length; i++) holes[i] = source[i].ring;
    return holes;
  }

  // src/triangulation/cross.js
  function cross(a, b, c) {
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  }

  // src/triangulation/equal.js
  function equal(a, b) {
    return a.x === b.x && a.y === b.y;
  }

  // src/triangulation/clean.js
  function clean(ring3) {
    let changed = true;
    let i, a, b, c;
    while (changed && ring3.length > 3) {
      changed = false;
      for (i = 0; i < ring3.length; i++) {
        a = ring3[(i + ring3.length - 1) % ring3.length], b = ring3[i], c = ring3[(i + 1) % ring3.length];
        if (equal(a, b) || Math.abs(cross(a, b, c)) < 1e-10) {
          ring3.splice(i, 1);
          changed = true;
          break;
        }
      }
    }
    if (ring3.length < 3) throw (
      /* alloc */
      new Error("Degenerate polygon ring")
    );
    return ring3;
  }

  // src/triangulation/isClockWise.js
  function isClockWise(points) {
    let area2 = 0;
    let i, a, b;
    for (i = 0; i < points.length; i++) {
      a = points[i], b = points[(i + 1) % points.length];
      area2 += a.x * b.y - b.x * a.y;
    }
    return area2 < 0;
  }

  // src/triangulation/polygonRings.js
  function polygonRings(paths, vertices) {
    const rings = (
      /* alloc */
      []
    );
    let offset = 0, index, path, ring3;
    for (index = 0; index < paths.length; index++) {
      path = paths[index];
      ring3 = clean(vertices.slice(offset, offset += path.length));
      if (isClockWise(ring3) !== Boolean(index)) ring3.reverse();
      rings.push(ring3);
    }
    return rings;
  }

  // src/triangulation/inside.js
  function inside(point, ring3) {
    let result = false;
    let i, j, a, b;
    for (i = 0, j = ring3.length - 1; i < ring3.length; j = i++) {
      a = ring3[i], b = ring3[j];
      if (a.y > point.y !== b.y > point.y && point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x) result = !result;
    }
    return result;
  }

  // src/triangulation/insideHole.js
  function insideHole(point, rings) {
    let i;
    for (i = 1; i < rings.length; i++) if (inside(point, rings[i])) return true;
    return false;
  }

  // src/triangulation/on.js
  function on(p, q, r) {
    return Math.min(p.x, q.x) <= r.x && r.x <= Math.max(p.x, q.x) && Math.min(p.y, q.y) <= r.y && r.y <= Math.max(p.y, q.y);
  }

  // src/triangulation/intersects.js
  function intersects(a, b, c, d) {
    if (equal(a, c) || equal(a, d) || equal(b, c) || equal(b, d)) return false;
    const abC = cross(a, b, c), abD = cross(a, b, d), cdA = cross(c, d, a), cdB = cross(c, d, b);
    return abC * abD < 0 && cdA * cdB < 0 || abC === 0 && on(a, b, c) || abD === 0 && on(a, b, d) || cdA === 0 && on(c, d, a) || cdB === 0 && on(c, d, b);
  }

  // src/triangulation/crossesRing.js
  function crossesRing(a, b, ring3) {
    let i;
    for (i = 0; i < ring3.length; i++) {
      if (intersects(a, b, ring3[i], ring3[(i + 1) % ring3.length])) return true;
    }
    return false;
  }

  // src/triangulation/crossesBoundary.js
  function crossesBoundary(a, b, polygon, rings) {
    if (crossesRing(a, b, polygon)) return true;
    let i;
    for (i = 1; i < rings.length; i++) if (crossesRing(a, b, rings[i])) return true;
    return false;
  }

  // src/triangulation/connectHole.js
  function connectHole(polygon, hole, rings, mid) {
    let h2 = -1, p2 = -1, distance = Infinity, h, p, a, b, d;
    for (h = 0; h < hole.length; h++) for (p = 0; p < polygon.length; p++) {
      a = hole[h], b = polygon[p], d = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
      if (d >= distance) continue;
      mid.x = (a.x + b.x) / 2;
      mid.y = (a.y + b.y) / 2;
      if (!inside(mid, rings[0]) || insideHole(mid, rings)) continue;
      if (crossesBoundary(a, b, polygon, rings)) continue;
      h2 = h;
      p2 = p;
      distance = d;
    }
    if (h2 < 0) throw (
      /* alloc */
      new Error("Unable to connect polygon hole")
    );
    return (
      /* alloc */
      [
        ...polygon.slice(0, p2 + 1),
        ...hole.slice(h2),
        ...hole.slice(0, h2 + 1),
        polygon[p2],
        ...polygon.slice(p2 + 1)
      ]
    );
  }

  // src/triangulation/containsVertex.js
  function containsVertex(polygon, a, b, c) {
    let p;
    for (p of polygon) {
      if (!equal(p, a) && !equal(p, b) && !equal(p, c) && cross(a, b, p) >= 0 && cross(b, c, p) >= 0 && cross(c, a, p) >= 0) return true;
    }
    return false;
  }

  // src/triangulation/clipEars.js
  function clipEars(polygon) {
    const result = (
      /* alloc */
      []
    );
    let clipped, i, a, b, c, p;
    while (polygon.length > 3) {
      clipped = false;
      for (i = 0; i < polygon.length; i++) {
        a = polygon[(i + polygon.length - 1) % polygon.length], b = polygon[i], c = polygon[(i + 1) % polygon.length];
        if (cross(a, b, c) <= 1e-10) continue;
        if (containsVertex(polygon, a, b, c)) continue;
        result.push(
          /* alloc */
          [a.index, b.index, c.index]
        );
        polygon.splice(i, 1);
        clipped = true;
        break;
      }
      if (!clipped) throw (
        /* alloc */
        new Error("Unable to triangulate polygon: invalid or self-intersecting rings")
      );
    }
    if (cross(...polygon) > 1e-10) {
      const triangle = (
        /* alloc */
        []
      );
      for (p of polygon) triangle.push(p.index);
      result.push(triangle);
    }
    return result;
  }

  // src/triangulation/area.js
  function area(ring3) {
    let sum = 0;
    let i, p, q;
    for (i = 0; i < ring3.length; i++) {
      p = ring3[i], q = ring3[(i + 1) % ring3.length];
      sum += p.x * q.y - q.x * p.y;
    }
    return Math.abs(sum) / 2;
  }

  // src/triangulation/validateArea.js
  function validateArea(rings, vertices, result) {
    let holeArea = 0, actual = 0, i, triangle;
    for (i = 1; i < rings.length; i++) holeArea += area(rings[i]);
    const expected = area(rings[0]) - holeArea;
    for (triangle of result) actual += cross(vertices[triangle[0]], vertices[triangle[1]], vertices[triangle[2]]) / 2;
    if (expected <= 0 || Math.abs(actual - expected) > Math.max(1e-7, expected * 1e-8)) throw (
      /* alloc */
      new Error("Polygon triangulation area mismatch")
    );
  }

  // src/triangulation/triangulate.js
  function triangulate(contour, holes = geometryEmpty) {
    const paths = (
      /* alloc */
      [contour, ...holes]
    );
    const points = paths.flat();
    let p, index, hole;
    for (p of points) {
      if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) throw (
        /* alloc */
        new Error("Invalid polygon coordinates")
      );
    }
    const vertices = (
      /* alloc */
      []
    );
    for (index = 0; index < points.length; index++) {
      p = points[index];
      vertices.push(
        /* alloc */
        { x: p.x - contour[0].x, y: p.y - contour[0].y, index }
      );
    }
    const rings = polygonRings(paths, vertices);
    let polygon = rings[0].slice();
    const holesToConnect = sortHoles(rings.slice(1));
    const mid = holesToConnect.length ? (
      /* alloc */
      { x: 0, y: 0 }
    ) : null;
    for (hole of holesToConnect) {
      polygon = connectHole(polygon, hole, rings, mid);
    }
    const result = clipEars(polygon);
    validateArea(rings, vertices, result);
    return result;
  }

  // src/sources/groundOffset.js
  function groundOffset(point) {
    return point.ground || 0;
  }

  // src/geometry/appendAreaTriangle.js
  function addTriangle(context, a, ah, b, bh, c, ch, nx, ny, nz, color) {
    const { backend: layer, positions, normals, colors, uvs } = context;
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
    if (layer.options.nightLight) uvs.push(...a.uv, ...b.uv, ...c.uv);
  }

  // src/geometry/buildProjectedPolygon.js
  function buildProjectedPolygon(context, paths, top, bottom, baseColor) {
    const points = (
      /* alloc */
      []
    );
    let path, point, a, b, c, index, sign, i, length, nx, nz;
    for (path of paths) for (point of path) points.push(point);
    for ([a, b, c] of triangulate(paths[0], paths.slice(1))) {
      addTriangle(context, points[a], top, points[b], top, points[c], top, 0, 1, 0, baseColor);
      if (bottom > 0) addTriangle(context, points[a], bottom, points[b], bottom, points[c], bottom, 0, -1, 0, baseColor);
    }
    for (index = 0; index < paths.length; index++) {
      path = paths[index];
      sign = isClockWise(path) === (index === 0) ? -1 : 1;
      for (i = 0; i < path.length; i++) {
        a = path[i], b = path[(i + 1) % path.length];
        length = Math.hypot(b.x - a.x, b.y - a.y);
        if (!length) continue;
        nx = sign * (b.y - a.y) / length, nz = sign * (b.x - a.x) / length;
        addTriangle(context, a, bottom, b, bottom, b, top, nx, 0, nz, baseColor);
        addTriangle(context, a, bottom, b, top, a, top, nx, 0, nz, baseColor);
      }
    }
  }

  // src/globals/triangleContexts.js
  var triangleContexts = [];

  // src/geometry/addGeneratedTriangle.js
  function addGeneratedTriangle(...args) {
    addTriangle(triangleContexts[triangleContexts.length - 1], ...args);
  }

  // src/geometry/generateTreeGeometry.js
  function generateTreeGeometry(context, generator, point, style) {
    triangleContexts.push(context);
    try {
      generator(point, style, addGeneratedTriangle);
    } finally {
      triangleContexts.pop();
    }
  }

  // src/colors/toSRGB.js
  function toSRGB(value) {
    return value <= 31308e-7 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055;
  }

  // src/colors/hslChannel.js
  function channel(n, h, l, a) {
    const k = (n + h * 12) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  }

  // src/colors/parseColor.js
  function parseColor(value) {
    if (value && typeof value === "object" && "h" in value) {
      const a = value.s * Math.min(value.l, 1 - value.l);
      return (
        /* alloc */
        {
          r: toSRGB(channel(0, value.h, value.l, a)),
          g: toSRGB(channel(8, value.h, value.l, a)),
          b: toSRGB(channel(4, value.h, value.l, a))
        }
      );
    }
    if (value && typeof value === "object" && "r" in value) {
      return value;
    }
    if (typeof value === "number") {
      return (
        /* alloc */
        {
          r: (value >> 16 & 255) / 255,
          g: (value >> 8 & 255) / 255,
          b: (value & 255) / 255
        }
      );
    }
    if (typeof value !== "string" || !CSS.supports("color", value)) {
      throw (
        /* alloc */
        new Error("Invalid 3D color")
      );
    }
    const context = document.createElement("canvas").getContext("2d");
    context.fillStyle = value;
    context.fillRect(0, 0, 1, 1);
    const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
    return (
      /* alloc */
      {
        r: r / 255,
        g: g / 255,
        b: b / 255
      }
    );
  }

  // src/globals/lampDirections.js
  var lampDirections = [
    { x: Math.cos(0 * Math.PI / 3), y: Math.sin(0 * Math.PI / 3), nx: Math.cos(0.5 * Math.PI / 3), nz: -Math.sin(0.5 * Math.PI / 3) },
    { x: Math.cos(1 * Math.PI / 3), y: Math.sin(1 * Math.PI / 3), nx: Math.cos(1.5 * Math.PI / 3), nz: -Math.sin(1.5 * Math.PI / 3) },
    { x: Math.cos(2 * Math.PI / 3), y: Math.sin(2 * Math.PI / 3), nx: Math.cos(2.5 * Math.PI / 3), nz: -Math.sin(2.5 * Math.PI / 3) },
    { x: Math.cos(3 * Math.PI / 3), y: Math.sin(3 * Math.PI / 3), nx: Math.cos(3.5 * Math.PI / 3), nz: -Math.sin(3.5 * Math.PI / 3) },
    { x: Math.cos(4 * Math.PI / 3), y: Math.sin(4 * Math.PI / 3), nx: Math.cos(4.5 * Math.PI / 3), nz: -Math.sin(4.5 * Math.PI / 3) },
    { x: Math.cos(5 * Math.PI / 3), y: Math.sin(5 * Math.PI / 3), nx: Math.cos(5.5 * Math.PI / 3), nz: -Math.sin(5.5 * Math.PI / 3) }
  ];

  // src/geometry/createLampRing.js
  function ring(point, radius) {
    const points = (
      /* alloc */
      new Array(lampDirections.length)
    );
    let i;
    for (i = 0; i < points.length; i++) {
      points[i] = /* alloc */
      {
        x: point.x + lampDirections[i].x * radius,
        y: point.y + lampDirections[i].y * radius,
        ground: point.ground,
        uv: (
          /* alloc */
          [3, 3]
        )
      };
    }
    return points;
  }

  // src/geometry/lampPostGeometry.js
  function lampPostGeometry(point, style, addTriangle2) {
    const color = parseColor(5264986), radius = style.poleRadius;
    if (!Number.isFinite(radius) || radius <= 0) {
      throw (
        /* alloc */
        new Error("Invalid lamp pole radius")
      );
    }
    const center = (
      /* alloc */
      {
        ...point,
        uv: (
          /* alloc */
          [3, 3]
        )
      }
    );
    let r, low, high, points, i, a, b, nx, nz, section;
    for (section = 0; section < 2; section++) {
      r = section ? radius * 2.5 : radius;
      low = section ? style.top - 0.25 : 0;
      high = section ? style.top + 0.15 : style.top;
      points = ring(point, r);
      for (i = 0; i < 6; i++) {
        a = points[i], b = points[(i + 1) % 6];
        nx = lampDirections[i].nx, nz = lampDirections[i].nz;
        addTriangle2(a, low, b, low, b, high, nx, 0, nz, color);
        addTriangle2(a, low, b, high, a, high, nx, 0, nz, color);
        addTriangle2(center, high, a, high, b, high, 0, 1, 0, color);
        addTriangle2(center, low, b, low, a, low, 0, -1, 0, color);
      }
    }
  }

  // src/geometry/quad.js
  function quad(addTriangle2, color, a, b, c, d, height, nx, ny, nz) {
    if (typeof nx !== "number") {
      addTriangle2(a, height, b, height, c, height, ...nx, color);
      addTriangle2(a, height, c, height, d, height, ...nx, color);
    } else {
      addTriangle2(a, height, b, height, c, height, nx, ny, nz, color);
      addTriangle2(a, height, c, height, d, height, nx, ny, nz, color);
    }
  }

  // src/geometry/emitter.js
  function emitter(point, u, v, axis) {
    const r = 0.65;
    return (
      /* alloc */
      {
        x: point.x + (axis === 2 ? 0 : u * r),
        y: point.y + (axis === 1 ? 0 : axis === 2 ? u * r : v * r),
        ground: point.ground + (axis === 0 ? 0 : v * r),
        uv: (
          /* alloc */
          [u, v]
        )
      }
    );
  }

  // src/geometry/lightGeometry.js
  function lightGeometry(point, style, addTriangle2) {
    if (!Number.isFinite(style.lightRadius) || style.lightRadius <= 0) throw (
      /* alloc */
      new Error("Invalid light radius")
    );
    const color = parseColor(style.color);
    let axis;
    for (axis = 0; axis < 3; axis++) {
      quad(
        addTriangle2,
        color,
        emitter(point, -1, -1, axis),
        emitter(point, 1, -1, axis),
        emitter(point, 1, 1, axis),
        emitter(point, -1, 1, axis),
        style.top,
        axis === 2 ? 1 : 0,
        axis === 0 ? 1 : 0,
        axis === 1 ? 1 : 0
      );
    }
  }

  // src/globals/roundProfile.js
  var roundProfile = [
    [0, 0],
    [0.35, 0.8],
    [0.6, 1],
    [0.85, 0.7],
    [1, 0]
  ];

  // src/globals/ringDirections.js
  var ringDirections = [
    {
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
    }
  ];

  // src/geometry/createTreeRing.js
  function ring2(point, radius) {
    const result = (
      /* alloc */
      new Array(ringDirections.length)
    );
    let i;
    for (i = 0; i < result.length; i++) {
      result[i] = /* alloc */
      {
        x: point.x + ringDirections[i].x * radius,
        y: point.y + ringDirections[i].y * radius,
        ground: point.ground
      };
    }
    return result;
  }

  // src/geometry/surface.js
  function surface(point, addTriangle2, lowRadius, low, highRadius, high, color) {
    const lower = ring2(point, lowRadius), upper = ring2(point, highRadius);
    let i, next, slope, length, nx, nz, ny, normalX, normalZ;
    for (i = 0; i < 8; i++) {
      next = (i + 1) % 8;
      slope = (lowRadius - highRadius) / (high - low);
      length = Math.hypot(1, slope);
      ({ nx, nz } = ringDirections[i]);
      ny = slope / length;
      normalX = nx / length, normalZ = nz / length;
      if (lowRadius) addTriangle2(lower[i], low, lower[next], low, upper[next], high, normalX, ny, normalZ, color);
      if (highRadius) addTriangle2(lower[i], low, upper[next], high, upper[i], high, normalX, ny, normalZ, color);
    }
  }

  // src/geometry/validateTree.js
  function validateTree(trunkRadius, crownRadius, crownBottom, bottom, top, crownShape) {
    if (!Number.isFinite(trunkRadius) || !Number.isFinite(crownRadius) || !Number.isFinite(crownBottom) || trunkRadius <= 0 || crownRadius < trunkRadius || crownBottom <= bottom || crownBottom >= top || crownShape !== "round" && crownShape !== "cone") {
      throw (
        /* alloc */
        new Error("Invalid tree dimensions or crown shape")
      );
    }
  }

  // src/geometry/treeGeometry.js
  function treeGeometry(point, style, addTriangle2) {
    const { top, bottom = 0, trunkRadius, crownRadius, crownBottom, crownShape = "round" } = style;
    validateTree(trunkRadius, crownRadius, crownBottom, bottom, top, crownShape);
    const trunk = parseColor(style.trunkColor ?? 7491898);
    const crown = parseColor(style.color ?? 5210683);
    surface(point, addTriangle2, trunkRadius, bottom, trunkRadius, crownBottom + (top - crownBottom) * 0.25, trunk);
    let i, low, lr, high, hr;
    if (crownShape === "cone") {
      const base = ring2(point, crownRadius);
      for (i = 0; i < 8; i++) addTriangle2(
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
      surface(point, addTriangle2, crownRadius, crownBottom, 0, top, crown);
    } else {
      for (i = 1; i < roundProfile.length; i++) {
        [low, lr] = roundProfile[i - 1], [high, hr] = roundProfile[i];
        surface(
          point,
          addTriangle2,
          lr * crownRadius,
          crownBottom + low * (top - crownBottom),
          hr * crownRadius,
          crownBottom + high * (top - crownBottom),
          crown
        );
      }
    }
  }

  // src/geometry/buildProjectedPoint.js
  function buildProjectedPoint(context, projected, style, baseColor, support) {
    const { top } = style;
    if (context.backend.options.nightLight) {
      if (!Number.isFinite(style.lightFlux) || style.lightFlux <= 0) throw (
        /* alloc */
        new Error("Invalid light flux")
      );
      if (style.poleRadius > 0 && !context.supports.has(support)) {
        generateTreeGeometry(context, lampPostGeometry, projected, style);
        context.supports.add(support);
      }
      generateTreeGeometry(context, lightGeometry, projected, style);
      context.lights.push(
        /* alloc */
        {
          position: (
            /* alloc */
            [projected.x, projected.ground + top, -projected.y]
          ),
          radius: Math.hypot(top, style.lightRadius),
          color: (
            /* alloc */
            [baseColor.r, baseColor.g, baseColor.b]
          ),
          flux: style.lightFlux
        }
      );
    } else generateTreeGeometry(context, treeGeometry, projected, style);
  }

  // src/geometry/instanceAreaGeometry.js
  function instanceAreaGeometry(context) {
    const { positions, normals, colors, featureFaces } = context;
    if (context.backend.options.nightLight || featureFaces.length < 2) return context;
    const vertices = featureFaces[0].vertexEnd;
    const length = vertices * 3;
    if (!vertices || positions.length !== length * featureFaces.length) return context;
    const originX = Math.trunc(positions[0]), originY = Math.trunc(positions[1]), originZ = Math.trunc(positions[2]);
    const template = (
      /* alloc */
      new Float32Array(length)
    );
    let i, instance, face, start;
    for (i = 0; i < length; i++) template[i] = positions[i] - (i % 3 === 0 ? originX : i % 3 === 1 ? originY : originZ);
    const offsets = (
      /* alloc */
      new Float32Array(featureFaces.length * 4)
    );
    for (instance = 0; instance < featureFaces.length; instance++) {
      face = featureFaces[instance];
      start = instance * length;
      if (face.vertexStart !== instance * vertices || face.vertexEnd !== (instance + 1) * vertices) return context;
      offsets[instance * 4] = originX + positions[start] - positions[0];
      offsets[instance * 4 + 1] = originY + positions[start + 1] - positions[1];
      offsets[instance * 4 + 2] = originZ + positions[start + 2] - positions[2];
      offsets[instance * 4 + 3] = instance * vertices;
      for (i = 0; i < length; i++) {
        if (Math.fround(template[i] + offsets[instance * 4 + i % 3]) !== Math.fround(positions[start + i]) || Math.fround(normals[i]) !== Math.fround(normals[start + i]) || Math.fround(colors[i]) !== Math.fround(colors[start + i])) return context;
      }
    }
    return (
      /* alloc */
      {
        positions: template,
        normals: normals.slice(0, length),
        colors: colors.slice(0, length),
        instanceOffsets: offsets
      }
    );
  }

  // src/geometry/computeBounds.js
  function computeBounds(geometry) {
    const min = (
      /* alloc */
      [Infinity, Infinity, Infinity]
    );
    const max = (
      /* alloc */
      [-Infinity, -Infinity, -Infinity]
    );
    const data = geometry.attributes.position.data;
    let i, x, y, z;
    for (i = 0; i < data.length; i += 3) {
      x = data[i], y = data[i + 1], z = data[i + 2];
      min[0] = Math.min(min[0], x), max[0] = Math.max(max[0], x);
      min[1] = Math.min(min[1], y), max[1] = Math.max(max[1], y);
      min[2] = Math.min(min[2], z), max[2] = Math.max(max[2], z);
    }
    const instances = geometry.attributes.instanceOffset;
    if (instances) {
      let axis, offset, low, high;
      for (axis = 0; axis < 3; axis++) {
        low = Infinity;
        high = -Infinity;
        for (offset = axis; offset < instances.data.length; offset += instances.size) {
          low = Math.min(low, instances.data[offset]);
          high = Math.max(high, instances.data[offset]);
        }
        min[axis] = Math.fround(min[axis] + low);
        max[axis] = Math.fround(max[axis] + high);
      }
    }
    const center = (
      /* alloc */
      [
        (min[0] + max[0]) / 2,
        (min[1] + max[1]) / 2,
        (min[2] + max[2]) / 2
      ]
    );
    let radiusSquared = 0;
    for (i = 0; !instances && i < data.length; i += 3) {
      x = data[i] - center[0], y = data[i + 1] - center[1], z = data[i + 2] - center[2];
      radiusSquared = Math.max(radiusSquared, x * x + y * y + z * z);
    }
    let radius = instances ? Math.hypot(max[0] - min[0], max[1] - min[1], max[2] - min[2]) / 2 : Math.sqrt(radiusSquared);
    if (!instances && (radiusSquared === Infinity || radiusSquared < Number.MIN_VALUE / Number.EPSILON)) {
      radius = 0;
      for (i = 0; i < data.length; i += 3) {
        radius = Math.max(radius, Math.hypot(
          data[i] - center[0],
          data[i + 1] - center[1],
          data[i + 2] - center[2]
        ));
      }
    }
    geometry.bounds = /* alloc */
    { min, max, center, radius };
  }

  // src/geometry/assembleAreaGeometry.js
  function assembleAreaGeometry({ jobs, nightLight }) {
    const context = (
      /* alloc */
      {
        backend: (
          /* alloc */
          { options: (
            /* alloc */
            { nightLight }
          ) }
        ),
        positions: (
          /* alloc */
          []
        ),
        normals: (
          /* alloc */
          []
        ),
        colors: (
          /* alloc */
          []
        ),
        uvs: (
          /* alloc */
          []
        ),
        featureFaces: (
          /* alloc */
          []
        ),
        lights: (
          /* alloc */
          []
        ),
        supports: (
          /* alloc */
          /* @__PURE__ */ new Set()
        )
      }
    );
    let job, polygon, start, end;
    for (job of jobs) {
      start = context.positions.length / 3;
      if (job.point) buildProjectedPoint(context, job.point, job.style, job.baseColor, job.support);
      for (polygon of job.polygons) {
        buildProjectedPolygon(context, polygon, job.style.top, job.style.bottom, job.baseColor);
      }
      end = context.positions.length / 3;
      context.featureFaces.push(
        /* alloc */
        { vertexStart: start, vertexEnd: end, faceStart: start / 3, faceEnd: end / 3 }
      );
    }
    const data = instanceAreaGeometry(context);
    const result = (
      /* alloc */
      {
        positions: (
          /* alloc */
          new Float32Array(data.positions)
        ),
        normals: (
          /* alloc */
          new Float32Array(data.normals)
        ),
        colors: (
          /* alloc */
          new Float32Array(data.colors)
        ),
        uvs: (
          /* alloc */
          new Float32Array(context.uvs)
        ),
        instanceOffsets: data.instanceOffsets,
        ranges: context.featureFaces,
        lights: context.lights
      }
    );
    if (result.positions.length) {
      const geometry = (
        /* alloc */
        { attributes: (
          /* alloc */
          {
            position: (
              /* alloc */
              { data: result.positions }
            ),
            instanceOffset: result.instanceOffsets ? (
              /* alloc */
              { data: result.instanceOffsets, size: 4 }
            ) : void 0
          }
        ) }
      );
      computeBounds(geometry);
      result.bounds = geometry.bounds;
    }
    return result;
  }

  // src/workers/geometryWorker.js
  function onGeometryMessage(event) {
    try {
      const data = assembleAreaGeometry(event.data);
      const transfers = (
        /* alloc */
        [data.positions.buffer, data.normals.buffer, data.colors.buffer, data.uvs.buffer]
      );
      if (data.instanceOffsets) transfers.push(data.instanceOffsets.buffer);
      self.postMessage(data, transfers);
    } catch (error) {
      self.postMessage(
        /* alloc */
        { error: (
          /* alloc */
          { name: error.name, message: error.message }
        ) }
      );
    }
  }
  self.addEventListener("message", onGeometryMessage);
})();
//# sourceMappingURL=leaflet-city-mapper-worker-src.js.map
