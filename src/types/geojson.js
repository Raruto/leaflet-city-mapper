import './3d.js';
import { onTerrainChange } from "../utils/onTerrainChange.js";
import { updateArea } from "../utils/updateArea.js";
import { releaseArea } from "../utils/releaseArea.js";

/** One GeoJSON batch, independent of the viewport, using the existing extrusion pipeline. */
L.Layer.types.geojson = L.Layer.types['3d'].extend({
  _geojson: true,

  getEvents() {
    return { terrainchange: () => onTerrainChange(this) };
  },

  setData(data) {
    this.options.data = data;
    delete this.options.url;
    for (const area of this._areas.values()) releaseArea(this, area);
    this._areas.clear();
    updateArea(this);
    return this;
  },
});
