import{destroyTexture as o}from"./destroyTexture.js";import{setParent as s}from"./setParent.js";import{update as i}from"./update.js";function l(e,t){e._terrainRequest?.abort();const r=e._rasterTiles.get(t);r&&(s(r,null),i(e),o(e,r.texture.texture),e._rasterTiles.delete(t))}export{l as removeRasterTile};
//# sourceMappingURL=removeRasterTile.js.map
