const openlayers = new URLSearchParams(location.search).get('engine') === 'openlayers';
document.write((openlayers
  ? '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ol@10.6.1/ol.css">' +
    '<script src="https://cdn.jsdelivr.net/npm/ol@10.6.1/dist/ol.js"><\/script>' +
    '<script src="../libs/openlayers-bindings.min.js"><\/script>'
  : '<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9/dist/leaflet.css"><script src="https://unpkg.com/leaflet@1.9/dist/leaflet-src.js"><\/script>') +
  '<link rel="stylesheet" href="map-engine.css">');

document.addEventListener('DOMContentLoaded', () => {
  const attribution = map.getContainer().querySelector('.leaflet-control-attribution,.ol-attribution');
  if (attribution) {
    const footer = L.DomUtil.create('div', 'map-attribution-footer', map.getContainer());
    footer.append(attribution);
    L.DomEvent.disableClickPropagation(footer);
    L.DomEvent.disableScrollPropagation(footer);
    const updateHeight = () => {
      const height = `${footer.getBoundingClientRect().height}px`;
      map.getContainer().style.setProperty('--map-attribution-height', height);
      document.body.style.setProperty('--map-attribution-height', height);
    };
    const resize = new ResizeObserver(updateHeight);
    updateHeight();
    resize.observe(footer);
    map.once('unload', () => { resize.disconnect(); footer.remove(); });
  }
  const EngineControl = L.Control.extend({
    onAdd() {
      const container = L.DomUtil.create('div', 'leaflet-bar map-engine-control');
      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.disableScrollPropagation(container);
      const button = L.DomUtil.create('button', '', container);
      button.type = 'button';
      button.title = `Try it with ${openlayers ? 'Leaflet' : 'OpenLayers'}`;
      button.setAttribute('aria-label', button.title);
      const icon = L.DomUtil.create('img', '', button);
      icon.alt = '';
      icon.src = openlayers
        ? 'https://leafletjs.com/docs/images/favicon.svg'
        : 'https://openlayers.org/theme/img/logo-dark.svg';
      button.addEventListener('click', () => {
        const url = new URL(location.href);
        if (openlayers) url.searchParams.delete('engine');
        else url.searchParams.set('engine', 'openlayers');
        location.assign(url.href);
      });
      return container;
    },
  });
  new EngineControl({ position: 'bottomleft' }).addTo(map);
});
