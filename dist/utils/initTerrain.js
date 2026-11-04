import{onTerrainRemove as t}from"./onTerrainRemove.js";import{onTerrainAdd as d}from"./onTerrainAdd.js";function a(n,e){const o=e.url,i={...e};delete i.url,n._init3D(i),n.terrainSource=o,n._terrainTiles=new Map,n._rasterTiles=new Map,n._terrainReady=!1,n.onAdd=r=>d(n,r),n.onRemove=r=>t(n,r)}export{a as initTerrain};
//# sourceMappingURL=initTerrain.js.map
