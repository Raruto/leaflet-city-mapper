import{getElevation as r}from"./getElevation.js";function s(t){if(!t.root||!t.location)return;t._terrainBaseY??=t.root.position[1];const o=t._map?._terrain3D,i=o&&r(o,t.location),n=Number.isFinite(i)?t.options.terrainOffset??0:0;t.root.position[1]=t._terrainBaseY+(i??0)+n}export{s as setTerrainHeight};
//# sourceMappingURL=setTerrainHeight.js.map
