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

  // src/mvt/createMvtReader.js
  function createMvtReader(bytes) {
    return (
      /* alloc */
      {
        bytes,
        view: (
          /* alloc */
          new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
        ),
        pos: 0
      }
    );
  }

  // src/mvt/takeMvtBytes.js
  function takeMvtBytes(reader, size) {
    if (!Number.isSafeInteger(size) || size < 0 || size > reader.bytes.length - reader.pos) {
      throw (
        /* alloc */
        new Error("Truncated MVT field")
      );
    }
    const start = reader.pos;
    reader.pos += size;
    return start;
  }

  // src/mvt/readMvtInteger.js
  function readMvtInteger(reader) {
    let value = 0n, i = 0, byte;
    for (; i < 10; i++) {
      byte = reader.bytes[takeMvtBytes(reader, 1)];
      if (i === 9 && byte > 1) throw (
        /* alloc */
        new Error("Invalid MVT varint")
      );
      value |= BigInt(byte & 127) << BigInt(i * 7);
      if (byte < 128) return value;
    }
    throw (
      /* alloc */
      new Error("Invalid MVT varint")
    );
  }

  // src/mvt/readMvtNumber.js
  function readMvtNumber(reader) {
    const value = readMvtInteger(reader);
    if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
      throw (
        /* alloc */
        new Error("MVT integer exceeds safe range")
      );
    }
    return Number(value);
  }

  // src/mvt/readMvtField.js
  function readMvtField(reader) {
    const tag = readMvtNumber(reader);
    const field = Math.floor(tag / 8), wire = tag % 8;
    if (!field || field > 536870911) throw (
      /* alloc */
      new Error("Invalid MVT field number")
    );
    return (
      /* alloc */
      [field, wire]
    );
  }

  // src/mvt/expectMvtWire.js
  function expectMvtWire(wire, expected) {
    if (wire !== expected) throw (
      /* alloc */
      new Error("Invalid MVT wire type")
    );
  }

  // src/mvt/numericMvtValue.js
  function numericMvtValue(value) {
    return value >= BigInt(Number.MIN_SAFE_INTEGER) && value <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(value) : value.toString();
  }

  // src/mvt/finishMvtPath.js
  function finishMvtPath(path, type, closed) {
    if (path && (type === 2 && path.length < 2 || type === 3 && !closed)) {
      throw (
        /* alloc */
        new Error("Incomplete MVT geometry")
      );
    }
  }

  // src/mvt/appendMvtCoordinates.js
  function appendMvtCoordinates(commands, state, count) {
    let i = 0, dx, dy;
    for (; i < count; i++) {
      dx = commands[state.index++];
      dy = commands[state.index++];
      if (dx > 4294967295 || dy > 4294967295) throw (
        /* alloc */
        new Error("Invalid MVT coordinate")
      );
      state.x += dx % 2 ? -(dx + 1) / 2 : dx / 2;
      state.y += dy % 2 ? -(dy + 1) / 2 : dy / 2;
      state.path.push(
        /* alloc */
        [state.x, state.y]
      );
    }
  }

  // src/mvt/beginMvtPath.js
  function beginMvtPath(state, paths, type, count) {
    finishMvtPath(state.path, type, state.closed);
    if (type !== 1 && count !== 1) throw (
      /* alloc */
      new Error("Invalid MVT MoveTo")
    );
    state.path = /* alloc */
    [];
    paths.push(state.path);
    state.closed = false;
  }

  // src/mvt/closeMvtPath.js
  function closeMvtPath(state, type, count) {
    if (type !== 3 || count !== 1 || !state.path || state.closed || state.path.length < 3) {
      throw (
        /* alloc */
        new Error("Invalid MVT ClosePath")
      );
    }
    state.path.push(
      /* alloc */
      [...state.path[0]]
    );
    state.closed = true;
  }

  // src/mvt/readMvtGeometry.js
  function readMvtGeometry(commands, type) {
    const paths = (
      /* alloc */
      []
    );
    const state = (
      /* alloc */
      { x: 0, y: 0, path: null, closed: false, index: 0 }
    );
    let command, id, count;
    while (state.index < commands.length) {
      command = commands[state.index++];
      id = command % 8;
      count = Math.floor(command / 8);
      if (!count || command > 4294967295) throw (
        /* alloc */
        new Error("Invalid MVT geometry command")
      );
      if (id === 7) {
        closeMvtPath(state, type, count);
        continue;
      }
      if (id !== 1 && id !== 2 || count > Math.floor((commands.length - state.index) / 2)) {
        throw (
          /* alloc */
          new Error("Invalid MVT geometry parameters")
        );
      }
      if (id === 1) beginMvtPath(state, paths, type, count);
      else if (type === 1 || !state.path || state.closed) throw (
        /* alloc */
        new Error("Invalid MVT LineTo")
      );
      appendMvtCoordinates(commands, state, count);
    }
    finishMvtPath(state.path, type, state.closed);
    if (!paths.length) throw (
      /* alloc */
      new Error("Empty MVT geometry")
    );
    return paths;
  }

  // src/mvt/readMvtMessage.js
  function readMvtMessage(reader, wire) {
    expectMvtWire(wire, 2);
    const size = readMvtNumber(reader), start = takeMvtBytes(reader, size);
    return createMvtReader(reader.bytes.subarray(start, start + size));
  }

  // src/mvt/readMvtNumbers.js
  function readMvtNumbers(reader, wire, target) {
    let packed;
    if (wire === 0) target.push(readMvtNumber(reader));
    else {
      packed = readMvtMessage(reader, wire);
      while (packed.pos < packed.bytes.length) target.push(readMvtNumber(packed));
    }
  }

  // src/mvt/skipMvtField.js
  function skipMvtField(reader, wire) {
    switch (wire) {
      case 0:
        readMvtInteger(reader);
        break;
      case 1:
        takeMvtBytes(reader, 8);
        break;
      case 2:
        takeMvtBytes(reader, readMvtNumber(reader));
        break;
      case 5:
        takeMvtBytes(reader, 4);
        break;
      default:
        throw (
          /* alloc */
          new Error("Unsupported MVT wire type")
        );
    }
  }

  // src/mvt/readMvtFeature.js
  function readMvtFeature(reader, keys, values) {
    let id, type = 0, field, wire, i = 0;
    const tags = (
      /* alloc */
      []
    ), commands = (
      /* alloc */
      []
    );
    while (reader.pos < reader.bytes.length) {
      [field, wire] = readMvtField(reader);
      if (field === 1) {
        expectMvtWire(wire, 0);
        id = numericMvtValue(readMvtInteger(reader));
      } else if (field === 2) readMvtNumbers(reader, wire, tags);
      else if (field === 3) {
        expectMvtWire(wire, 0);
        type = readMvtNumber(reader);
      } else if (field === 4) readMvtNumbers(reader, wire, commands);
      else skipMvtField(reader, wire);
    }
    if (tags.length % 2 || type > 3) throw (
      /* alloc */
      new Error("Invalid MVT feature")
    );
    const properties = /* @__PURE__ */ Object.create(null);
    for (; i < tags.length; i += 2) {
      if (tags[i] >= keys.length || tags[i + 1] >= values.length) {
        throw (
          /* alloc */
          new Error("Invalid MVT property index")
        );
      }
      properties[keys[tags[i]]] = values[tags[i + 1]];
    }
    return (
      /* alloc */
      { id, type, properties, geometry: type ? readMvtGeometry(commands, type) : (
        /* alloc */
        []
      ) }
    );
  }

  // src/globals/mvtTextDecoder.js
  var mvtTextDecoder = new TextDecoder("utf-8", { fatal: true });

  // src/mvt/readMvtString.js
  function readMvtString(reader, wire) {
    return mvtTextDecoder.decode(readMvtMessage(reader, wire).bytes);
  }

  // src/mvt/readMvtKnownValue.js
  function readMvtKnownValue(reader, field, wire) {
    let offset, integer;
    if (field === 1) return readMvtString(reader, wire);
    if (field === 2 || field === 3) {
      expectMvtWire(wire, field === 2 ? 5 : 1);
      offset = takeMvtBytes(reader, field === 2 ? 4 : 8);
      return field === 2 ? reader.view.getFloat32(offset, true) : reader.view.getFloat64(offset, true);
    }
    expectMvtWire(wire, 0);
    integer = readMvtInteger(reader);
    if (field === 4) return numericMvtValue(BigInt.asIntN(64, integer));
    if (field === 5) return numericMvtValue(integer);
    if (field === 6) return numericMvtValue(integer >> 1n ^ -(integer & 1n));
    return integer !== 0n;
  }

  // src/mvt/readMvtValue.js
  function readMvtValue(reader) {
    let value, found = false, field, wire;
    while (reader.pos < reader.bytes.length) {
      [field, wire] = readMvtField(reader);
      if (field < 1 || field > 7) {
        skipMvtField(reader, wire);
        continue;
      }
      if (found) throw (
        /* alloc */
        new Error("Multiple MVT value types")
      );
      found = true;
      value = readMvtKnownValue(reader, field, wire);
    }
    if (!found) throw (
      /* alloc */
      new Error("Empty MVT value")
    );
    return value;
  }

  // src/mvt/readMvtLayer.js
  function readMvtLayer(reader) {
    let name, version, extent = 4096, field, wire, value, i = 0;
    const keys = (
      /* alloc */
      []
    ), values = (
      /* alloc */
      []
    ), features = (
      /* alloc */
      []
    );
    while (reader.pos < reader.bytes.length) {
      [field, wire] = readMvtField(reader);
      if (field === 1) name = readMvtString(reader, wire);
      else if (field === 2) features.push(readMvtMessage(reader, wire));
      else if (field === 3) keys.push(readMvtString(reader, wire));
      else if (field === 4) values.push(readMvtValue(readMvtMessage(reader, wire)));
      else if (field === 5 || field === 15) {
        expectMvtWire(wire, 0);
        value = readMvtNumber(reader);
        if (field === 5) extent = value;
        else version = value;
      } else skipMvtField(reader, wire);
    }
    if (!name || !/* alloc */
    [1, 2].includes(version) || !extent || extent > 4294967295) {
      throw (
        /* alloc */
        new Error("Invalid MVT layer metadata")
      );
    }
    for (; i < features.length; i++) features[i] = readMvtFeature(features[i], keys, values);
    return (
      /* alloc */
      { name, extent, features }
    );
  }

  // src/mvt/decodeVectorTile.js
  function decodeVectorTile(buffer) {
    if (!(buffer instanceof ArrayBuffer) && !(buffer instanceof Uint8Array)) {
      throw (
        /* alloc */
        new TypeError("MVT input must be an ArrayBuffer or Uint8Array")
      );
    }
    const bytes = buffer instanceof Uint8Array ? buffer : (
      /* alloc */
      new Uint8Array(buffer)
    );
    const reader = createMvtReader(bytes);
    const layers = (
      /* alloc */
      []
    ), names = (
      /* alloc */
      /* @__PURE__ */ new Set()
    );
    let field, wire, layer;
    while (reader.pos < reader.bytes.length) {
      [field, wire] = readMvtField(reader);
      if (field !== 3) {
        skipMvtField(reader, wire);
        continue;
      }
      layer = readMvtLayer(readMvtMessage(reader, wire));
      if (names.has(layer.name)) throw (
        /* alloc */
        new Error("Duplicate MVT layer name")
      );
      names.add(layer.name);
      layers.push(layer);
    }
    return layers;
  }

  // src/vector-tiles/vectorStyleDependencies.js
  function vectorStyleDependencies(entry) {
    const dependencies = (
      /* alloc */
      /* @__PURE__ */ new Set()
    );
    const expressions = (
      /* alloc */
      [entry.paint, entry.filter]
    );
    let value, child;
    while (expressions.length) {
      value = expressions.pop();
      if (!value || typeof value !== "object") continue;
      if (Array.isArray(value) && typeof value[1] === "string" && /* alloc */
      ["get", "has", "==", "!=", "<", ">", "<=", ">=", "in", "!in"].includes(value[0])) {
        dependencies.add(value[1]);
      }
      for (child of Object.values(value)) expressions.push(child);
    }
    return dependencies;
  }

  // src/vector-style/evaluateBoolean.js
  function evaluateBoolean(op, args, properties, zoom, legacy) {
    let i = 0;
    if (op === "all") {
      for (i = 0; i < args.length; i++) {
        if (!evaluateStyle(args[i], properties, zoom, legacy)) return false;
      }
      return true;
    }
    if (op === "any") {
      for (i = 0; i < args.length; i++) {
        if (evaluateStyle(args[i], properties, zoom, legacy)) return true;
      }
      return false;
    }
    throw (
      /* alloc */
      new Error(`Unsupported vector style expression: ${op}`)
    );
  }

  // src/vector-style/evaluateCoalesceOrCase.js
  function evaluateCoalesceOrCase(op, args, properties, zoom, legacy) {
    let i = 0, result = null;
    if (op === "coalesce") {
      for (i = 0; i < args.length; i++) {
        result = evaluateStyle(args[i], properties, zoom);
        if (result !== null && result !== void 0) return result;
      }
      return null;
    }
    if (op === "case") {
      for (i = 0; i < args.length - 1; i += 2) {
        if (evaluateStyle(args[i], properties, zoom)) {
          return evaluateStyle(args[i + 1], properties, zoom);
        }
      }
      return evaluateStyle(args[args.length - 1], properties, zoom);
    }
    throw (
      /* alloc */
      new Error(`Unsupported vector style expression: ${op}`)
    );
  }

  // src/vector-style/evaluateInput.js
  function evaluateInput(value, properties, zoom, legacy) {
    if (legacy && typeof value === "string") return properties[value];
    return evaluateStyle(value, properties, zoom);
  }

  // src/vector-style/evaluateComparison.js
  function evaluateComparison(op, args, properties, zoom, legacy) {
    const left = evaluateInput(args[0], properties, zoom, legacy);
    const right = evaluateStyle(args[1], properties, zoom);
    switch (op) {
      case "==":
        return left === right;
      case "!=":
        return left !== right;
      case "<=":
        return left <= right;
      case ">=":
        return left >= right;
      case "<":
        return left < right;
      case ">":
        return left > right;
      default:
        throw (
          /* alloc */
          new Error(`Unsupported vector style expression: ${op}`)
        );
    }
  }

  // src/globals/vectorStyleNamedColors.js
  var vectorStyleNamedColors = {
    black: [0, 0, 0, 1],
    white: [255, 255, 255, 1],
    gray: [128, 128, 128, 1],
    blue: [0, 0, 255, 1],
    red: [255, 0, 0, 1],
    green: [0, 128, 0, 1]
  };

  // src/vector-style/parseFunctionalColor.js
  function parseFunctionalColor(value) {
    const match = /^rgba?\(([^)]+)\)$/.exec(value);
    if (match) {
      const values = match[1].split(",");
      let i = 0, finite = true;
      for (i = 0; i < values.length; i++) values[i] = Number(values[i]);
      if (values.length === 3) values.push(1);
      for (i = 0; i < values.length; i++) {
        if (!Number.isFinite(values[i])) finite = false;
      }
      if (values.length === 4 && finite) return values;
    }
    throw (
      /* alloc */
      new Error(`Unsupported interpolated style color: ${value}`)
    );
  }

  // src/vector-style/parseHexColor.js
  function parseHexColor(value) {
    let i = 0, offset = 0;
    if (value.length === 4) {
      value = "#" + value[1] + value[1] + value[2] + value[2] + value[3] + value[3];
    }
    const color = (
      /* alloc */
      []
    );
    for (i = 1; i < 6; i += 2) {
      offset = parseInt(value.slice(i, i + 2), 16);
      color.push(offset);
    }
    color.push(1);
    return color;
  }

  // src/vector-style/styleColor.js
  function styleColor(value) {
    if (Object.hasOwn(vectorStyleNamedColors, value)) return vectorStyleNamedColors[value];
    if (/^#[0-9a-f]{3}$/i.test(value) || /^#[0-9a-f]{6}$/i.test(value)) {
      return parseHexColor(value);
    }
    return parseFunctionalColor(value);
  }

  // src/vector-style/evaluateInterpolate.js
  function evaluateInterpolate(args, properties, zoom) {
    const result = evaluateStyle(args[1], properties, zoom);
    const base = args[0][0] === "exponential" ? args[0][1] : 1;
    let i = 0, lower = 0, upper = 0, ratio = 0, left = null, right = null, j = 0, color = "";
    if (result <= args[2]) return evaluateStyle(args[3], properties, zoom);
    for (i = 4; i < args.length; i += 2) {
      if (result > args[i]) continue;
      lower = args[i - 2];
      upper = args[i];
      ratio = base === 1 ? (result - lower) / (upper - lower) : (base ** (result - lower) - 1) / (base ** (upper - lower) - 1);
      left = evaluateStyle(args[i - 1], properties, zoom);
      right = evaluateStyle(args[i + 1], properties, zoom);
      if (typeof left === "number" && typeof right === "number") return left + (right - left) * ratio;
      left = styleColor(left);
      right = styleColor(right);
      for (j = 0; j < 3; j++) {
        if (j) color += ",";
        color += Math.round(left[j] + (right[j] - left[j]) * ratio);
      }
      return `rgba(${color},${left[3] + (right[3] - left[3]) * ratio})`;
    }
    return evaluateStyle(args.at(-1), properties, zoom);
  }

  // src/vector-style/arrayContainsRange.js
  function arrayContainsRange(values, start, end, target) {
    let i = 0, value = null;
    for (i = start; i < end; i++) {
      value = values[i];
      if (value === target || value !== value && target !== target) return true;
    }
    return false;
  }

  // src/vector-style/evaluateMembership.js
  function evaluateMembership(op, args, properties, zoom, legacy) {
    let target = null;
    if (op === "!in") {
      target = evaluateInput(args[0], properties, zoom, legacy);
      return !arrayContainsRange(args, 1, args.length, target);
    }
    if (legacy) {
      target = evaluateInput(args[0], properties, zoom, true);
      return arrayContainsRange(args, 1, args.length, target);
    }
    const values = evaluateStyle(args[1], properties, zoom);
    target = evaluateInput(args[0], properties, zoom, false);
    return values.includes(target);
  }

  // src/vector-style/evaluateIExpression.js
  function evaluateIExpression(op, args, properties, zoom, legacy) {
    if (op === "in") return evaluateMembership(op, args, properties, zoom, legacy);
    if (op === "interpolate") return evaluateInterpolate(args, properties, zoom);
    throw (
      /* alloc */
      new Error(`Unsupported vector style expression: ${op}`)
    );
  }

  // src/vector-style/evaluateMath.js
  function evaluateMath(op, args, properties, zoom) {
    let i = 0, sum = 0;
    if (op === "+") {
      for (i = 0; i < args.length; i++) sum += evaluateStyle(args[i], properties, zoom);
      return sum;
    }
    if (op === "-") {
      if (args.length === 1) return -evaluateStyle(args[0], properties, zoom);
      return evaluateStyle(args[0], properties, zoom) - evaluateStyle(args[1], properties, zoom);
    }
    throw (
      /* alloc */
      new Error(`Unsupported vector style expression: ${op}`)
    );
  }

  // src/vector-style/evaluateMatch.js
  function evaluateMatch(args, properties, zoom) {
    const result = evaluateStyle(args[0], properties, zoom);
    let i = 0, matched = false;
    for (i = 1; i < args.length - 1; i += 2) {
      if (Array.isArray(args[i])) matched = args[i].includes(result);
      else matched = args[i] === result;
      if (matched) return evaluateStyle(args[i + 1], properties, zoom);
    }
    return evaluateStyle(args[args.length - 1], properties, zoom);
  }

  // src/vector-style/evaluateNegation.js
  function evaluateNegation(op, args, properties, zoom, legacy) {
    if (op === "!") return !evaluateStyle(args[0], properties, zoom, legacy);
    if (op === "!=") {
      return evaluateInput(args[0], properties, zoom, legacy) !== evaluateStyle(args[1], properties, zoom);
    }
    if (op === "!in") return evaluateMembership(op, args, properties, zoom, legacy);
    throw (
      /* alloc */
      new Error(`Unsupported vector style expression: ${op}`)
    );
  }

  // src/vector-style/evaluatePrimitive.js
  function evaluatePrimitive(op, args, properties, zoom) {
    switch (op) {
      case "literal":
        return args[0];
      case "get":
        return properties[args[0]];
      case "has":
        return Object.hasOwn(properties, args[0]);
      case "zoom":
        return zoom;
      default:
        throw (
          /* alloc */
          new Error(`Unsupported vector style expression: ${op}`)
        );
    }
  }

  // src/vector-style/evaluateStep.js
  function evaluateStep(args, properties, zoom) {
    const result = evaluateStyle(args[0], properties, zoom);
    let output = args[1], i = 0;
    for (i = 2; i < args.length; i += 2) {
      if (result < args[i]) break;
      output = args[i + 1];
    }
    return evaluateStyle(output, properties, zoom);
  }

  // src/vector-style/evaluateToExpression.js
  function evaluateToExpression(op, args, properties, zoom) {
    if (op === "to-boolean") return Boolean(evaluateStyle(args[0], properties, zoom));
    if (op === "to-number") {
      let i = 0, number = 0;
      for (i = 0; i < args.length; i++) {
        number = Number(evaluateStyle(args[i], properties, zoom));
        if (Number.isFinite(number)) return number;
      }
      throw (
        /* alloc */
        new Error("Invalid numeric style expression")
      );
    }
    throw (
      /* alloc */
      new Error(`Unsupported vector style expression: ${op}`)
    );
  }

  // src/vector-style/evaluateStyle.js
  function evaluateStyle(value, properties, zoom, legacy = false) {
    if (!Array.isArray(value)) return value;
    const op = value[0];
    const args = value.slice(1);
    const operation = String(op);
    if (/^(?:literal|get|has|zoom)$/.test(operation)) {
      return evaluatePrimitive(op, args, properties, zoom);
    }
    switch (operation[0]) {
      case "a":
        return evaluateBoolean(op, args, properties, zoom, legacy);
      case "!":
        return evaluateNegation(op, args, properties, zoom, legacy);
      case "=":
      case "<":
      case ">":
        return evaluateComparison(op, args, properties, zoom, legacy);
      case "i":
        return evaluateIExpression(op, args, properties, zoom, legacy);
      case "t":
        return evaluateToExpression(op, args, properties, zoom, legacy);
      case "c":
        return evaluateCoalesceOrCase(op, args, properties, zoom, legacy);
      case "m":
        return evaluateMatch(args, properties, zoom);
      case "s":
        return evaluateStep(args, properties, zoom);
      default:
        return evaluateMath(op, args, properties, zoom);
    }
  }

  // src/vector-style/visibleStyle.js
  function visibleStyle(layer, properties, zoom) {
    return zoom >= (layer.minzoom ?? 0) && zoom < (layer.maxzoom ?? Infinity) && layer.layout?.visibility !== "none" && (!layer.filter || evaluateStyle(layer.filter, properties, zoom, true));
  }

  // src/vector-tiles/vectorFeatureZoom.js
  function vectorFeatureZoom(entry, properties, zoom, maxZoom) {
    if (visibleStyle(entry, properties, zoom)) return zoom;
    zoom = maxZoom;
    while (zoom >= 0 && !visibleStyle(entry, properties, zoom)) zoom--;
    return zoom;
  }

  // src/vector-tiles/projectVectorPoint.js
  function projectVectorPoint(point, coords, extent) {
    const size = 2 ** coords.z;
    const x = (coords.x + point[0] / extent) / size;
    const y = (coords.y + point[1] / extent) / size;
    return (
      /* alloc */
      [Math.atan(Math.sinh(Math.PI * (1 - 2 * y))) * 180 / Math.PI, x * 360 - 180]
    );
  }

  // src/vector-tiles/vectorLabelProperty.js
  function vectorLabelProperty(properties, match, key) {
    return properties[key] ?? "";
  }

  // src/vector-tiles/vectorStyleValue.js
  function vectorStyleValue(object, key, fallback, properties, zoom) {
    return object?.[key] === void 0 ? fallback : evaluateStyle(object[key], properties, zoom);
  }

  // src/vector-tiles/prepareVectorLabel.js
  function prepareVectorLabel(job, layer, entry, feature, order) {
    let text = entry.layout?.["text-field"];
    const { properties } = feature, { zoom } = job;
    if (Array.isArray(text)) text = evaluateStyle(text, properties, zoom);
    if (typeof text !== "string") return;
    text = text.replace(/\{([^}]+)\}/g, vectorLabelProperty.bind(null, properties));
    if (!text.trim()) return;
    if (entry.layout?.["text-transform"] === "uppercase") text = text.toUpperCase();
    const path = feature.geometry[0];
    if (!path?.length) return;
    const point = path[Math.floor(path.length / 2)];
    if (point[0] < 0 || point[0] >= layer.extent || point[1] < 0 || point[1] >= layer.extent) return;
    job.labels.push(
      /* alloc */
      {
        text,
        latlng: projectVectorPoint(point, job.coords, layer.extent),
        order,
        entry,
        properties,
        size: vectorStyleValue(entry.layout, "text-size", 12, properties, zoom),
        color: vectorStyleValue(entry.paint, "text-color", "#000", properties, zoom),
        halo: vectorStyleValue(entry.paint, "text-halo-color", "#fff", properties, zoom),
        haloWidth: vectorStyleValue(entry.paint, "text-halo-width", 0, properties, zoom),
        priority: (
          /* alloc */
          ["place_labels", "place"].includes(entry["source-layer"]) ? 0 : (
            /* alloc */
            ["street_labels", "transportation_name"].includes(entry["source-layer"]) ? 1 : 2
          )
        )
      }
    );
  }

  // src/vector-style/readPaintValue.js
  function readPaintValue(paint, key, fallback, properties, zoom) {
    if (paint[key] === void 0) return fallback;
    return evaluateStyle(paint[key], properties, zoom);
  }

  // src/vector-style/fillVectorPaint.js
  function fillVectorPaint(paint, properties, zoom) {
    const fill = styleColor(readPaintValue(paint, "fill-color", "#000", properties, zoom));
    const outline = readPaintValue(paint, "fill-outline-color", null, properties, zoom);
    const rgb = outline === null ? null : styleColor(outline);
    const fillOpacity = readPaintValue(paint, "fill-opacity", 1, properties, zoom) * fill[3];
    const fillColor = (
      /* alloc */
      { r: fill[0] / 255, g: fill[1] / 255, b: fill[2] / 255 }
    );
    const color = rgb ? (
      /* alloc */
      { r: rgb[0] / 255, g: rgb[1] / 255, b: rgb[2] / 255 }
    ) : null;
    return (
      /* alloc */
      {
        fillColor,
        fillOpacity,
        color,
        weight: 0.5
      }
    );
  }

  // src/vector-style/scaleDashArray.js
  function scaleDashArray(dash, weight, properties, zoom) {
    if (!dash) return void 0;
    let values = dash, i = 0, result = "";
    if (typeof dash[0] !== "number") values = evaluateStyle(dash, properties, zoom);
    if (!Array.isArray(values)) throw (
      /* alloc */
      new TypeError("Style dash array must be an array")
    );
    for (i = 0; i < values.length; i++) {
      if (i) result += " ";
      result += values[i] * weight;
    }
    return result;
  }

  // src/vector-style/lineVectorPaint.js
  function lineVectorPaint(layer, paint, properties, zoom) {
    const weight = readPaintValue(paint, "line-width", 1, properties, zoom);
    const rgb = styleColor(readPaintValue(paint, "line-color", "#000", properties, zoom));
    const opacity = readPaintValue(paint, "line-opacity", 1, properties, zoom) * rgb[3];
    const dashArray = scaleDashArray(paint["line-dasharray"], weight, properties, zoom);
    const lineCap = layer.layout?.["line-cap"] || "butt";
    const lineJoin = layer.layout?.["line-join"] || "miter";
    const color = (
      /* alloc */
      { r: rgb[0] / 255, g: rgb[1] / 255, b: rgb[2] / 255 }
    );
    return (
      /* alloc */
      {
        color,
        opacity,
        weight,
        dashArray,
        lineCap,
        lineJoin
      }
    );
  }

  // src/vector-style/vectorPaint.js
  function vectorPaint(layer, properties, zoom) {
    const paint = layer.paint || /* alloc */
    {};
    if (layer.type === "fill") return fillVectorPaint(paint, properties, zoom);
    return lineVectorPaint(layer, paint, properties, zoom);
  }

  // src/vector-tiles/vectorFeaturePaint.js
  function vectorFeaturePaint(entry, feature, sampleZoom, maxZoom) {
    if (entry.type === "fill") return feature.type === 3 ? vectorPaint(entry, feature.properties, sampleZoom) : null;
    if (entry.type !== "line" || feature.type !== 2) return null;
    let paint = vectorPaint(entry, feature.properties, sampleZoom), candidate;
    if (paint.weight > 0 && paint.opacity > 0) return paint;
    for (candidate = maxZoom; candidate >= 0; candidate--) {
      if (!visibleStyle(entry, feature.properties, candidate)) continue;
      paint = vectorPaint(entry, feature.properties, candidate);
      if (paint.weight > 0 && paint.opacity > 0) return paint;
    }
    return null;
  }

  // src/mvt/mvtEdgeX.js
  function mvtEdgeX(edge, y) {
    return edge[0][0] + (y - edge[0][1]) * (edge[1][0] - edge[0][0]) / (edge[1][1] - edge[0][1]);
  }

  // src/mvt/addMvtCrossings.js
  function addMvtCrossings(edges, levels) {
    let i = 0, j, a, b, top, bottom, start, end;
    for (; i < edges.length; i++) {
      a = edges[i];
      for (j = i + 1; j < edges.length; j++) {
        b = edges[j];
        top = Math.max(a[0][1], b[0][1]);
        bottom = Math.min(a[1][1], b[1][1]);
        if (top >= bottom) continue;
        start = mvtEdgeX(a, top) - mvtEdgeX(b, top);
        end = mvtEdgeX(a, bottom) - mvtEdgeX(b, bottom);
        if (start * end < 0) levels.add(top + (bottom - top) * start / (start - end));
      }
    }
  }

  // src/mvt/mergeMvtActiveEdges.js
  function mergeMvtActiveEdges(active, sorted, left, mid, right) {
    let i = left, j = mid, k = left;
    while (i < mid && j < right) {
      if (active[j].x < active[i].x) sorted[k++] = active[j++];
      else sorted[k++] = active[i++];
    }
    while (i < mid) sorted[k++] = active[i++];
    while (j < right) sorted[k++] = active[j++];
  }

  // src/mvt/sortMvtActiveEdges.js
  function sortMvtActiveEdges(active) {
    const sorted = (
      /* alloc */
      new Array(active.length)
    );
    let width = 1, left, mid, right, i;
    while (width < active.length) {
      for (left = 0; left < active.length; left += width * 2) {
        mid = Math.min(left + width, active.length);
        right = Math.min(left + width * 2, active.length);
        mergeMvtActiveEdges(active, sorted, left, mid, right);
      }
      for (i = 0; i < active.length; i++) active[i] = sorted[i];
      width *= 2;
    }
  }

  // src/mvt/appendMvtBandTriangles.js
  function appendMvtBandTriangles(edges, top, bottom, triangles) {
    const mid = (top + bottom) / 2, active = (
      /* alloc */
      []
    );
    let edge, i = 0, leftTop, leftBottom, rightTop, rightBottom;
    for (edge of edges) {
      if (edge[0][1] < mid && edge[1][1] > mid) {
        active.push(
          /* alloc */
          { edge, x: mvtEdgeX(edge, mid) }
        );
      }
    }
    sortMvtActiveEdges(active);
    if (active.length % 2) throw (
      /* alloc */
      new Error("Unbalanced MVT polygon edges")
    );
    for (; i < active.length; i += 2) {
      leftTop = mvtEdgeX(active[i].edge, top);
      leftBottom = mvtEdgeX(active[i].edge, bottom);
      rightTop = mvtEdgeX(active[i + 1].edge, top);
      rightBottom = mvtEdgeX(active[i + 1].edge, bottom);
      if (rightTop < leftTop - 1e-8 || rightBottom < leftBottom - 1e-8) {
        throw (
          /* alloc */
          new Error("Crossing MVT polygon edges")
        );
      }
      if ((rightTop - leftTop) * (bottom - top) > 1e-6) {
        triangles.push(
          /* alloc */
          [
            /* alloc */
            [leftTop, top],
            /* alloc */
            [rightTop, top],
            /* alloc */
            [leftBottom, bottom]
          ]
        );
      }
      if ((rightBottom - leftBottom) * (bottom - top) > 1e-6) {
        triangles.push(
          /* alloc */
          [
            /* alloc */
            [rightTop, top],
            /* alloc */
            [rightBottom, bottom],
            /* alloc */
            [leftBottom, bottom]
          ]
        );
      }
    }
  }

  // src/mvt/finiteMvtCoordinate.js
  function finiteMvtCoordinate(point) {
    let i = 0;
    for (; i < point.length; i++) {
      if (!Number.isFinite(point[i])) return false;
    }
    return true;
  }

  // src/mvt/collectMvtEdges.js
  function collectMvtEdges(rings, edges, levels) {
    let ring3, i, a, b;
    for (ring3 of rings) {
      if (ring3.length < 4 || ring3[0][0] !== ring3.at(-1)[0] || ring3[0][1] !== ring3.at(-1)[1]) {
        throw (
          /* alloc */
          new Error("MVT tessellation requires closed rings")
        );
      }
      for (i = 1; i < ring3.length; i++) {
        a = ring3[i - 1];
        b = ring3[i];
        if (!finiteMvtCoordinate(a) || !finiteMvtCoordinate(b)) {
          throw (
            /* alloc */
            new Error("Invalid MVT ring coordinate")
          );
        }
        levels.add(a[1]);
        if (a[1] !== b[1]) edges.push(
          /* alloc */
          [a[1] < b[1] ? a : b, a[1] < b[1] ? b : a]
        );
      }
    }
  }

  // src/mvt/sortedMvtLevels.js
  function sortedMvtLevels(levels) {
    const sorted = (
      /* alloc */
      []
    );
    let y, gap = 0, i = 0, j, value, count = 0;
    for (y of levels) sorted.push(y);
    gap = Math.floor(sorted.length / 2);
    for (; gap > 0; gap = Math.floor(gap / 2)) {
      for (i = gap; i < sorted.length; i++) {
        value = sorted[i];
        j = i;
        while (j >= gap && sorted[j - gap] > value) {
          sorted[j] = sorted[j - gap];
          j -= gap;
        }
        sorted[j] = value;
      }
    }
    for (i = 0; i < sorted.length; i++) {
      if (!count || sorted[i] - sorted[count - 1] > 1e-8) sorted[count++] = sorted[i];
    }
    sorted.length = count;
    return sorted;
  }

  // src/mvt/tessellateVectorRings.js
  function tessellateVectorRings(rings) {
    const edges = (
      /* alloc */
      []
    ), levels = (
      /* alloc */
      /* @__PURE__ */ new Set()
    ), triangles = (
      /* alloc */
      []
    );
    let sorted, i = 1, top, bottom;
    collectMvtEdges(rings, edges, levels);
    addMvtCrossings(edges, levels);
    sorted = sortedMvtLevels(levels);
    for (; i < sorted.length; i++) {
      top = sorted[i - 1];
      bottom = sorted[i];
      if (bottom > top) appendMvtBandTriangles(edges, top, bottom, triangles);
    }
    return triangles;
  }

  // src/mvt/isMvtFallbackError.js
  function isMvtFallbackError(error) {
    return error.message === "Polygon triangulation area mismatch" || error.message === "Degenerate polygon ring" || error.message === "Unable to triangulate polygon: invalid or self-intersecting rings" || error.message === "Unable to connect polygon hole";
  }

  // src/mvt/appendMvtPolygonTriangles.js
  function appendMvtPolygonTriangles(rings, paths, vertices, triangles) {
    let indices, index, triangle, points, i = 0;
    try {
      indices = triangulate(paths[0], paths.slice(1));
      for (triangle of indices) {
        points = /* alloc */
        [];
        for (index of triangle) points.push(
          /* alloc */
          [vertices[index].x, vertices[index].y]
        );
        triangles.push(points);
      }
    } catch (error) {
      if (!isMvtFallbackError(error)) throw error;
      indices = tessellateVectorRings(rings);
      for (; i < indices.length; i++) triangles.push(indices[i]);
    }
  }

  // src/mvt/groupMvtPolygons.js
  function groupMvtPolygons(rings) {
    const polygons = (
      /* alloc */
      []
    );
    let polygon, exteriorSign, ring3, area2, i;
    for (ring3 of rings) {
      if (ring3.length < 4 || ring3[0][0] !== ring3.at(-1)[0] || ring3[0][1] !== ring3.at(-1)[1]) {
        throw (
          /* alloc */
          new Error("MVT tessellation requires closed rings")
        );
      }
      area2 = 0;
      for (i = 1; i < ring3.length; i++) {
        if (!finiteMvtCoordinate(ring3[i]) || !finiteMvtCoordinate(ring3[i - 1])) {
          throw (
            /* alloc */
            new Error("Invalid MVT ring coordinate")
          );
        }
        area2 += ring3[i - 1][0] * ring3[i][1] - ring3[i][0] * ring3[i - 1][1];
      }
      if (!polygon || area2 && Math.sign(area2) === exteriorSign) {
        polygon = /* alloc */
        [];
        polygons.push(polygon);
        exteriorSign = Math.sign(area2);
      }
      polygon.push(ring3);
    }
    return polygons;
  }

  // src/mvt/mvtPathsVertices.js
  function mvtPathsVertices(paths) {
    const vertices = (
      /* alloc */
      []
    );
    let path, point;
    for (path of paths) {
      for (point of path) vertices.push(point);
    }
    return vertices;
  }

  // src/mvt/mvtPolygonPaths.js
  function mvtPolygonPaths(rings) {
    const paths = (
      /* alloc */
      []
    );
    let ring3, i, path;
    for (ring3 of rings) {
      path = /* alloc */
      [];
      for (i = 0; i < ring3.length - 1; i++) {
        path.push(
          /* alloc */
          { x: ring3[i][0], y: ring3[i][1] }
        );
      }
      paths.push(path);
    }
    return paths;
  }

  // src/mvt/triangulateVectorRings.js
  function triangulateVectorRings(rings) {
    const polygons = groupMvtPolygons(rings), triangles = (
      /* alloc */
      []
    );
    let polygon, paths, vertices;
    for (polygon of polygons) {
      paths = mvtPolygonPaths(polygon);
      vertices = mvtPathsVertices(paths);
      appendMvtPolygonTriangles(polygon, paths, vertices, triangles);
    }
    return triangles;
  }

  // src/vector-tiles/projectVectorTriangles.js
  function projectVectorTriangles(geometry, coords, extent) {
    const paths = (
      /* alloc */
      []
    );
    let triangle, projected, point;
    for (triangle of triangulateVectorRings(geometry)) {
      projected = /* alloc */
      [];
      for (point of triangle) projected.push(projectVectorPoint(point, coords, extent));
      paths.push(
        /* alloc */
        [projected]
      );
    }
    return paths;
  }

  // src/vector-tiles/simplifyVectorPath.js
  function simplifyVectorPath(path, tolerance) {
    if (path.length < 3) return path;
    const keep = (
      /* alloc */
      new Uint8Array(path.length)
    );
    const stack = (
      /* alloc */
      [
        /* alloc */
        [0, path.length - 1]
      ]
    ), output = (
      /* alloc */
      []
    );
    keep[0] = keep[path.length - 1] = 1;
    let start, end, a, b, dx, dy, length, index, distance, i, p, t, squared;
    while (stack.length) {
      [start, end] = stack.pop();
      a = path[start];
      b = path[end];
      dx = b[0] - a[0];
      dy = b[1] - a[1];
      length = dx * dx + dy * dy;
      index = -1;
      distance = tolerance * tolerance;
      for (i = start + 1; i < end; i++) {
        p = path[i];
        t = length ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / length)) : 0;
        squared = (p[0] - a[0] - t * dx) ** 2 + (p[1] - a[1] - t * dy) ** 2;
        if (squared > distance) {
          distance = squared;
          index = i;
        }
      }
      if (index >= 0) {
        keep[index] = 1;
        stack.push(
          /* alloc */
          [start, index],
          /* alloc */
          [index, end]
        );
      }
    }
    for (i = 0; i < path.length; i++) if (keep[i]) output.push(path[i]);
    return output;
  }

  // src/vector-tiles/projectVectorPaths.js
  function projectVectorPaths(geometry, coords, extent, tolerance) {
    const paths = (
      /* alloc */
      []
    );
    let path, projected, point;
    for (path of geometry) {
      projected = /* alloc */
      [];
      for (point of simplifyVectorPath(path, tolerance)) projected.push(projectVectorPoint(point, coords, extent));
      paths.push(projected);
    }
    return paths;
  }

  // src/vector-tiles/vectorFeaturePaths.js
  function vectorFeaturePaths(job, layer, entry, feature) {
    const cache = entry.type === "fill" ? job.triangles : job.projected;
    let paths = cache.get(feature);
    if (!paths) {
      const tolerance = layer.extent / 256 / 2 ** Math.max(0, job.maxZoom - job.coords.z) * 0.35;
      paths = entry.type === "fill" ? projectVectorTriangles(feature.geometry, job.coords, layer.extent) : projectVectorPaths(feature.geometry, job.coords, layer.extent, tolerance);
      cache.set(feature, paths);
    }
    return paths;
  }

  // src/vector-tiles/appendVectorBatch.js
  function appendVectorBatch(job, layer, entry, feature, order, batches, dependencies, paint) {
    const values = (
      /* alloc */
      []
    );
    let key, batch, path, count;
    for (key of dependencies) values.push(feature.properties[key]);
    key = JSON.stringify(
      /* alloc */
      [paint, values]
    );
    batch = batches.get(key);
    if (!batch) {
      batch = /* alloc */
      {
        kind: entry.type,
        order,
        paint,
        properties: feature.properties,
        entry,
        paths: (
          /* alloc */
          []
        ),
        coordinates: 0
      };
      batches.set(key, batch);
    }
    for (path of vectorFeaturePaths(job, layer, entry, feature)) {
      count = entry.type === "fill" ? 3 : path.length;
      if (batch.coordinates + count > 6e3 && batch.paths.length) {
        job.output.push(
          /* alloc */
          { ...batch, paths: batch.paths }
        );
        batch.paths = /* alloc */
        [];
        batch.coordinates = 0;
      }
      batch.paths.push(path);
      batch.coordinates += count;
    }
  }

  // src/vector-tiles/prepareVectorStyleLayer.js
  function prepareVectorStyleLayer(job, layer, entry, order) {
    const batches = (
      /* alloc */
      /* @__PURE__ */ new Map()
    ), dependencies = vectorStyleDependencies(entry);
    let feature, sampleZoom, paint, batch;
    for (feature of layer.features) {
      sampleZoom = vectorFeatureZoom(entry, feature.properties, job.zoom, job.maxZoom);
      if (sampleZoom < 0) continue;
      if (entry.type === "symbol") {
        prepareVectorLabel(job, layer, entry, feature, order);
        continue;
      }
      paint = vectorFeaturePaint(entry, feature, sampleZoom, job.maxZoom);
      if (paint) appendVectorBatch(job, layer, entry, feature, order, batches, dependencies, paint);
    }
    for (batch of batches.values()) if (batch.paths.length) job.output.push(batch);
  }

  // src/vector-tiles/prepareVectorTile.js
  function prepareVectorTile(buffer, coords, style, zoom, source, maxZoom = 19) {
    const layers = decodeVectorTile(buffer), byName = (
      /* alloc */
      /* @__PURE__ */ new Map()
    );
    const job = (
      /* alloc */
      {
        coords,
        zoom,
        maxZoom,
        output: (
          /* alloc */
          []
        ),
        labels: (
          /* alloc */
          []
        ),
        triangles: (
          /* alloc */
          /* @__PURE__ */ new WeakMap()
        ),
        projected: (
          /* alloc */
          /* @__PURE__ */ new WeakMap()
        )
      }
    );
    let layer, order, entry;
    for (layer of layers) byName.set(layer.name, layer);
    for ([order, entry] of style.entries()) {
      layer = byName.get(entry["source-layer"]);
      if (!layer || source !== void 0 && entry.source !== source) continue;
      prepareVectorStyleLayer(job, layer, entry, order);
    }
    return (
      /* alloc */
      { batches: job.output, labels: job.labels }
    );
  }

  // src/workers/vectorTileWorker.js
  function onVectorTileMessage({ data }) {
    try {
      const result = prepareVectorTile(data.buffer, data.coords, data.style, data.zoom, data.source, data.maxZoom);
      self.postMessage(
        /* alloc */
        { id: data.id, ...result }
      );
    } catch (error) {
      self.postMessage(
        /* alloc */
        { id: data.id, error: error.message }
      );
    }
  }

  // src/workers/geometryWorker.js
  function onGeometryMessage(event) {
    if (event.data.type === "vector") {
      onVectorTileMessage(event);
      return;
    }
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
