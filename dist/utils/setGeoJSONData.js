import{releaseArea as e}from"./releaseArea.js";import{updateArea as a}from"./updateArea.js";function f(r,o){r.options.data=o,delete r.options.url;for(const t of r._areas.values())e(r,t);return r._areas.clear(),a(r),r}export{f as setGeoJSONData};
//# sourceMappingURL=setGeoJSONData.js.map
