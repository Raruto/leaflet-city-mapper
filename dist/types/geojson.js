import"./3d.js";import{onTerrainChange as r,releaseArea as a,updateArea as s}from"../scene/sources.js";L.Layer.types.geojson=L.Layer.types["3d"].extend({_geojson:!0,getEvents(){return{terrainchange:()=>r(this)}},setData(e){this.options.data=e,delete this.options.url;for(const t of this._areas.values())a(this,t);return this._areas.clear(),s(this),this}});
//# sourceMappingURL=geojson.js.map
