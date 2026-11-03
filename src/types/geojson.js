import './3d.js';

/** One GeoJSON batch, independent of the viewport, using the existing extrusion pipeline. */
L.Layer.types.geojson = L.Layer.types['3d'].extend({
  _geojson: true,

  async _loadSource(area) {
    const { data, url } = this.options;
    if (typeof this.options.featureStyle !== 'function') {
      throw new Error('featureStyle must be a function');
    }
    if ((data !== undefined) === (url !== undefined)) {
      throw new Error('GeoJSON source requires either data or url');
    }
    if (data !== undefined) return data;
    if (typeof url !== 'string' || !url.trim()) throw new Error('Invalid GeoJSON URL');
    const response = await fetch(new URL(url, document.baseURI), { signal: area.request.signal });
    if (!response.ok) throw new Error(`Unable to load GeoJSON: HTTP ${response.status}`);
    return response.json();
  },

  _updateArea() {
    if (!this._map || !this._shared) return;
    if (!this._areas.has('geojson')) {
      this._areas.set('geojson', { request: new AbortController() });
    }
    this._pump();
  },

  getEvents() {
    return { terrainchange: this._onTerrainChange };
  },

  setData(data) {
    this.options.data = data;
    delete this.options.url;
    for (const area of this._areas.values()) this._releaseArea(area);
    this._areas.clear();
    this._updateArea();
    return this;
  },
});
