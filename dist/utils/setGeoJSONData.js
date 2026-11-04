import{releaseArea as a}from"./releaseArea.js";import{updateArea as r}from"./updateArea.js";function p(o,t){o.options.data=t,delete o.options.url;for(const e of o._areas.values())a(o,e);return o._areas.clear(),r(o),o}export{p as setGeoJSONData};
//# sourceMappingURL=setGeoJSONData.js.map
