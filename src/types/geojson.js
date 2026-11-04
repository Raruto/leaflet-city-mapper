import { setGeoJSONData } from '../utils/setGeoJSONData.js';

/** One GeoJSON batch, independent of the viewport, using the existing extrusion pipeline. */
L.Layer.types.geojson = (layer, options) => {
  layer._geojson = true;
  layer.setData = data => setGeoJSONData(layer, data);
  L.Layer.types['3d'](layer, options);
};
