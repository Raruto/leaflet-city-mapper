import { setGeoJSONData } from '../utils/setGeoJSONData.js';

/** One GeoJSON batch, independent of the viewport, using the existing extrusion pipeline. */
L.Layer.types.geojson = L.Layer.types['3d'].extend({
  _geojson: true,
  setData(data) { return setGeoJSONData(this, data); },
});
