const e=`
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
`;export{e as elevationWGSL};
//# sourceMappingURL=elevationWGSL.js.map
