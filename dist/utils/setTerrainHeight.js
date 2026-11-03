function i(t){if(!t.root||!t.location)return;t._terrainBaseY??=t.root.position[1];const o=t._map?._terrain3D,n=o?._getElevation(t.location);t.root.position[1]=t._terrainBaseY+(n??0)+(o&&n!==null?t.options.terrainOffset??0:0)}export{i as setTerrainHeight};
//# sourceMappingURL=setTerrainHeight.js.map
