/**
 * Demo helper: loads Leaflet by default or OpenLayers with compatibility bindings
 * when ?engine=openlayers is set, and adds the engine switcher and footer styles.
 * Not required by leaflet-city-mapper: applications can include the official
 * Leaflet JavaScript and CSS directly before the plugin, without this demo UI.
 */
if (!/localhost|127.0.0.1|raruto.github.io/.test(location.hostname)) 
  alert("This loader is not intended for production use.\n\nInclude the official leaflet.js and leaflet.css directly instead.");

const openlayers = new URLSearchParams(location.search).get('engine') === 'openlayers';
document.write((openlayers
  ? '<link rel="stylesheet" href="https://unpkg.com/ol@10.6.1/ol.css">' +
    '<script src="https://unpkg.com/ol@10.6.1/dist/ol.js"><\/script>' +
    '<script src="https://unpkg.com/leaflet-city-mapper@0.1.0/libs/openlayers-bindings.min.js"><\/script>'
  : '<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9/dist/leaflet.css"><script src="https://unpkg.com/leaflet@1.9/dist/leaflet-src.js"><\/script>'));

const engineStyle = document.createElement('style');
engineStyle.textContent = /* css */`
.map-engine-control {background: white;border-radius: 4px;box-shadow: 0 1px 5px #0006;}
.map-engine-control button {display: flex;align-items: center;justify-content: center;width: 30px;height: 30px;margin: 0;padding: 3px;border: 0;border-radius: 2px;background: white;cursor: pointer;}
.map-engine-control button:hover { background: #f4f4f4; }
.map-engine-control button:focus-visible { outline: 2px solid #2675c9; }
.map-engine-control img { display: block; width: 24px; height: 24px; }
.map-attribution-footer {position: absolute;bottom: 0;left: 0;right: 0;z-index: 1000;}
.map-attribution-footer .leaflet-control-attribution,
.map-attribution-footer .ol-attribution {position: static;box-sizing: border-box;width: 100%;max-width: 100%;margin: 0;overflow-wrap: anywhere;}
.leaflet-container .leaflet-bottom { bottom: var(--map-attribution-height, 0px); }
.openlayers-city-mapper .ol-city-bottomleft,
.openlayers-city-mapper .ol-city-bottomright { bottom: calc(var(--map-attribution-height, 0px) + 8px); }
.view-on-github {position: absolute;bottom: calc(var(--map-attribution-height, 0px) + 10px);left: calc(50% - 81px);z-index: 1000;}
#status { bottom: calc(var(--map-attribution-height, 0px) + 52px); }
`;
document.head.append(engineStyle);

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
  class EngineControl extends L.Control {
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
    }
  }
  new EngineControl({ position: 'bottomleft' }).addTo(map);
});
