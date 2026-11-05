// Load after Leaflet and leaflet-city-mapper.
(() => {
  const L = globalThis.L || globalThis.leaflet;
  if (!L?.Control) throw new Error('Leaflet must be loaded before leaflet-lens.js');

  L.Control.Lens = L.Control.extend({
    options: { position: 'topright', radius: 100, enabled: true },

    initialize(outerLayer, innerLayer, options) {
      L.Util.setOptions(this, options);
      if (!outerLayer?.options || !innerLayer?.options || outerLayer === innerLayer) {
        throw new TypeError('Lens requires two distinct raster layers');
      }
      if (!Number.isFinite(this.options.radius) || this.options.radius <= 0) {
        throw new RangeError('Lens radius must be positive and finite in CSS pixels');
      }
      if (typeof this.options.enabled !== 'boolean') throw new TypeError('Lens enabled must be boolean');
      this._layers = [outerLayer, innerLayer];
    },

    onAdd(map) {
      for (const layer of this._layers) {
        if (layer._map && layer._map !== map) throw new Error('Lens layers must belong to the same map');
      }
      this._originalCutouts = this._layers.map(layer => ({
        own: Object.hasOwn(layer.options, 'cutout'), value: layer.options.cutout,
      }));
      this._masks = [
        { x: 0, y: 0, radius: 0 },
        { x: 0, y: 0, radius: 0, outside: true },
      ];
      for (let i = 0; i < this._layers.length; i++) {
        L.Util.setOptions(this._layers[i], { cutout: this._masks[i] });
      }
      this._lens = L.DomUtil.create('div', 'leaflet-lens', map.getContainer());
      this._lens.hidden = true;
      this._lens.setAttribute('aria-hidden', 'true');
      this._lens.style.cssText = `position:absolute;width:${this.options.radius * 2}px;height:${this.options.radius * 2}px;box-sizing:border-box;border:2px solid white;border-radius:50%;box-shadow:0 0 0 1px #333,0 2px 8px #0008;transform:translate(-50%,-50%);pointer-events:none;z-index:600`;
      const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control-lens');
      this._button = L.DomUtil.create('button', '', container);
      this._button.type = 'button';
      this._button.textContent = '🔍';
      this._button.title = 'Toggle lens; move the pointer over the map to reveal the layer underneath';
      this._button.setAttribute('aria-label', 'Toggle lens');
      this._button.style.cssText = 'display:block;border:0;border-radius:2px;padding:0 8px;min-width:30px;height:30px;background:white;color:#222;font:inherit;cursor:pointer';
      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.disableScrollPropagation(container);
      L.DomEvent.on(this._button, 'click', this._toggle, this);
      this._events = {
        pointermove: this._onPointerMove.bind(this), pointerleave: this._hide.bind(this),
        focus: this._onFocus.bind(this), blur: this._hide.bind(this), keydown: this._onKeyDown.bind(this),
      };
      for (const [type, handler] of Object.entries(this._events)) {
        map.getContainer().addEventListener(type, handler);
      }
      this.setEnabled(this.options.enabled);
      return container;
    },

    onRemove(map) {
      for (const [type, handler] of Object.entries(this._events)) {
        map.getContainer().removeEventListener(type, handler);
      }
      L.DomEvent.off(this._button, 'click', this._toggle, this);
      this._lens.remove();
      for (let i = 0; i < this._layers.length; i++) {
        const layer = this._layers[i], original = this._originalCutouts[i];
        if (layer.options.cutout !== this._masks[i]) continue;
        if (original.own) layer.options.cutout = original.value;
        else delete layer.options.cutout;
      }
      this._lens = this._button = this._masks = this._originalCutouts = this._events = null;
      map.fire('move');
    },

    setEnabled(enabled) {
      if (typeof enabled !== 'boolean') throw new TypeError('Lens enabled must be boolean');
      this.options.enabled = enabled;
      if (this._button) this._button.setAttribute('aria-pressed', String(enabled));
      if (this._lens) this._hide();
      return this;
    },

    _toggle() {
      this.setEnabled(!this.options.enabled);
    },

    _show(point) {
      if (!this.options.enabled) return;
      for (const mask of this._masks) {
        mask.x = point.x; mask.y = point.y; mask.radius = this.options.radius;
      }
      this._lens.style.left = `${point.x}px`;
      this._lens.style.top = `${point.y}px`;
      this._lens.hidden = false;
      this._map.fire('move');
    },

    _hide() {
      for (const mask of this._masks) mask.radius = 0;
      this._lens.hidden = true;
      this._map.fire('move');
    },

    _onPointerMove(event) {
      if (event.target.closest('.leaflet-control')) return this._hide();
      const container = this._map.getContainer(), bounds = container.getBoundingClientRect();
      this._show({
        x: (event.clientX - bounds.left) * container.offsetWidth / bounds.width - container.clientLeft,
        y: (event.clientY - bounds.top) * container.offsetHeight / bounds.height - container.clientTop,
      });
    },

    _onFocus() {
      this._show(this._map.getSize().divideBy(2));
    },

    _onKeyDown(event) {
      if (event.key === 'Escape') this._hide();
    },
  });
})();
