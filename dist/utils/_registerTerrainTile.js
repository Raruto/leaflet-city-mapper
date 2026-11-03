function a(r,e,i){if(!r._terrain3D)return;const t=r._terrain3D;t.addRasterTile(r,e,i).catch(n=>{r._terrain3D===t&&i.isConnected&&r.fire("tileerror",{tile:i,coords:e,error:n})})}export{a as _registerTerrainTile};
//# sourceMappingURL=_registerTerrainTile.js.map
