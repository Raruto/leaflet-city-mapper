import{destroyTexture as o}from"./destroyTexture.js";import{setParent as s}from"./setParent.js";import{update as i}from"./update.js";function f(e,r){e._terrainRequest?.abort();const t=e._rasterTiles.get(r);t&&(s(t,null),i(e),o(e,t.texture.texture),e._rasterTiles.delete(r))}export{f as removeRasterTile};
//# sourceMappingURL=removeRasterTile.js.map
