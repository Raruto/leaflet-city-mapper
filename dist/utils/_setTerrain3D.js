function o(r,t){if(r._terrain3D!==t){for(const{el:e}of Object.values(r._tiles||{}))r._terrain3D?.removeRasterTile(e);if(r._terrain3D=t||null,r._terrain3D)for(const{coords:e,el:i}of Object.values(r._tiles||{}))i.done&&r._registerTerrainTile(e,i)}}export{o as _setTerrain3D};
//# sourceMappingURL=_setTerrain3D.js.map
