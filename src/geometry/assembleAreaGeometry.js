import { buildProjectedPolygon } from './buildProjectedPolygon.js';
import { buildProjectedPoint } from './buildProjectedPoint.js';
import { instanceAreaGeometry } from './instanceAreaGeometry.js';
import { computeBounds } from './computeBounds.js';

export function assembleAreaGeometry({ jobs, nightLight }) {
  const context = /* alloc */ {
    backend: /* alloc */ { options: /* alloc */ { nightLight } },
    positions: /* alloc */ [], normals: /* alloc */ [], colors: /* alloc */ [], uvs: /* alloc */ [],
    featureFaces: /* alloc */ [], lights: /* alloc */ [], supports: /* alloc */ new Set(),
  };
  let job, polygon, start, end;
  for (job of jobs) {
    start = context.positions.length / 3;
    if (job.point) buildProjectedPoint(context, job.point, job.style, job.baseColor, job.support);
    for (polygon of job.polygons) {
      buildProjectedPolygon(context, polygon, job.style.top, job.style.bottom, job.baseColor);
    }
    end = context.positions.length / 3;
    context.featureFaces.push(/* alloc */ { vertexStart: start, vertexEnd: end, faceStart: start / 3, faceEnd: end / 3 });
  }
  const data = instanceAreaGeometry(context);
  const result = /* alloc */ {
    positions: /* alloc */ new Float32Array(data.positions),
    normals: /* alloc */ new Float32Array(data.normals),
    colors: /* alloc */ new Float32Array(data.colors),
    uvs: /* alloc */ new Float32Array(context.uvs),
    instanceOffsets: data.instanceOffsets,
    ranges: context.featureFaces,
    lights: context.lights,
  };
  if (result.positions.length) {
    const geometry = /* alloc */ { attributes: /* alloc */ {
      position: /* alloc */ { data: result.positions },
      instanceOffset: result.instanceOffsets ? /* alloc */ { data: result.instanceOffsets, size: 4 } : undefined,
    } };
    computeBounds(geometry);
    result.bounds = geometry.bounds;
  }
  return result;
}
