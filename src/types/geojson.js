import './3d.js';
import { onTerrainChange, releaseArea, updateArea } from '../scene/sources.js';

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
