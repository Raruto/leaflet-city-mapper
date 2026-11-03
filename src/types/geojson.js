import './3d.js';
import { onTerrainChange } from "../utils/onTerrainChange.js";
import { setGeoJSONData } from '../utils/setGeoJSONData.js';

/** One GeoJSON batch, independent of the viewport, using the existing extrusion pipeline. */
L.Layer.types.geojson = L.Layer.types['3d'].extend({
  _geojson: true,

  getEvents() {
    return { terrainchange: () => onTerrainChange(this) };
  },

  setData(data) { return setGeoJSONData(this, data); },
});
