function n(r){const e=r.renderer.sunlight;e.bindGroup=r.renderer.device.createBindGroup({layout:e.layout,entries:[{binding:0,resource:{buffer:e.buffer}},{binding:1,resource:e.texture.createView()},{binding:2,resource:e.sampler},{binding:3,resource:{buffer:e.lights}}]})}export{n as bindSunlight};
//# sourceMappingURL=bindSunlight.js.map
