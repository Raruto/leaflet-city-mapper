/**
 * Compute shader for vehicle poses; one workgroup shares lane lookup across model vertices.
 *
 * @type {string}
 */
export const trafficShader = /* wgsl */`
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
