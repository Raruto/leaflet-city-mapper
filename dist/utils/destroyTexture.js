function t(e,r){e.renderer.device.queue.onSubmittedWorkDone().then(()=>r.destroy(),o=>{e.fire("error",{error:o}),r.destroy()})}export{t as destroyTexture};
//# sourceMappingURL=destroyTexture.js.map
