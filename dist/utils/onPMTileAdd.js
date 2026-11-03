function i(r,e){r.header?(L.TileLayer.prototype.onAdd.call(r,e),r._setTerrain3D(e._terrain3D)):r.ready=r.ready.then(t=>(r._map===e&&e.hasLayer(r)&&!r._container&&(L.TileLayer.prototype.onAdd.call(r,e),r._setTerrain3D(e._terrain3D)),t))}export{i as onPMTileAdd};
//# sourceMappingURL=onPMTileAdd.js.map
