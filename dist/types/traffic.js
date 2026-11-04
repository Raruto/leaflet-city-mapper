import{build as y}from"../utils/build.js";import{tooltip as x}from"../utils/tooltip.js";import{speed as w}from"../utils/speed.js";import{vehicles as k}from"../utils/vehicles.js";import{addTraffic as z,placeTraffic as T,removeTraffic as _,readyTraffic as A,tickTraffic as I,updateTraffic as B,updateTrafficTerrain as D}from"../utils/traffic.js";L.Layer.types.traffic=function(a,{url:l,vehicle:u="car",side:i,outline:c,speed:p=w,...f}={}){const{model:r,lights:n,side:m}=k[u];i??=m,L.Layer.types["3d"](a,{tooltip:x,nightLight:!!n,...f});const o=L.DomUtil.create("small","traffic-status");o.style.cssText="display:block;max-width:200px;margin:0 0 4px 20px;color:#555;";const s=y(r(0)),d=s.position.length,v=d/3,t=new ArrayBuffer(16),b=new Float32Array(t),g=new Uint32Array(t),e={layer:a,url:l,model:r,lights:n,side:i,outline:c,velocity:p,status:o,template:s,stride:d,vertices:v,params:t,paramFloats:b,paramInts:g,ready:!1,frame:void 0,request:void 0,lanes:[],tripsKey:void 0,mesh:void 0,route:void 0,litAt:-1/0,trips:[],rebasedAt:0,nextCheck:-1/0,elapsed:0,gpu:null,lanesDirty:!0,stale:!1,loaded:void 0,file:void 0},h=`
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
    }`;e.shader=h,e.tick=I.bind(null,e),e.update=B.bind(null,e),e.terrain=D.bind(null,e),a._beforeRaycast=T.bind(null,e),a.on("ready",A.bind(null,e)),a.on("add",z.bind(null,e)),a.on("remove",_.bind(null,e))};
//# sourceMappingURL=traffic.js.map
