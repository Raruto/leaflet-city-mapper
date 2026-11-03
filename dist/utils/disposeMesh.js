import{removeProgram as e}from"./removeProgram.js";function i(o,r){if(r){o.remove(r);for(const t of Object.values(r.geometry.attributes))t.buffer.destroy();e(r.program)}}export{i as disposeMesh};
//# sourceMappingURL=disposeMesh.js.map
