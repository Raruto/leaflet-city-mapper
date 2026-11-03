import"./3d.js";import{onTerrainChange as t}from"../utils/onTerrainChange.js";import{setGeoJSONData as r}from"../utils/setGeoJSONData.js";L.Layer.types.geojson=L.Layer.types["3d"].extend({_geojson:!0,getEvents(){return{terrainchange:()=>t(this)}},setData(e){return r(this,e)}});
//# sourceMappingURL=geojson.js.map
