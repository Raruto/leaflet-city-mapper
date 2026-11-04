import{destroyTexture as o}from"./destroyTexture.js";import{setParent as s}from"./setParent.js";import{update as u}from"./update.js";function f(e,r){e._terrainRequest?.abort();const t=e._rasterTiles.get(r);t&&(s(t,null),u(e),t.texture!==r.texture&&o(e,t.texture.texture),e._rasterTiles.delete(r))}export{f as removeRasterTile};
//# sourceMappingURL=removeRasterTile.js.map
