import{destroyTexture as i}from"./destroyTexture";function o(e,r){e._terrainRequest?.abort();const t=e._rasterTiles.get(r);t&&(e.remove(t),i(e,t.texture.texture),e._rasterTiles.delete(r),r.style.visibility=r._terrainVisibility,delete r._terrainVisibility)}export{o as removeRasterTile};
//# sourceMappingURL=removeRasterTile.js.map
