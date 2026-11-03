import{bridgeElevation as e}from"./bridgeElevation";import{terrainElevation as o}from"./terrainElevation";function p(r,t){if(!r._map||!r._terrainReady)return null;const i=t instanceof L.Point?t:r._map.project(t,r._terrainZoom);return e(i,r._bridges)??o(i,r._terrainTiles)}export{p as getElevation};
//# sourceMappingURL=getElevation.js.map
