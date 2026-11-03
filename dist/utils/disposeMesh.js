import{setParent as o}from"./setParent.js";import{update as i}from"./update.js";function p(r,t){if(t){o(t,null),i(r);for(const e of Object.values(t.geometry.attributes))e.buffer.destroy();t.program.pipelineCache.clear()}}export{p as disposeMesh};
//# sourceMappingURL=disposeMesh.js.map
