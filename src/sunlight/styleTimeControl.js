export function styleTimeControl(container, nested) {
  container.classList.toggle('leaflet-control', !nested);
  container.classList.toggle('leaflet-bar', !nested);
  container.style.background = nested ? '' : '#fff';
  container.style.padding = nested ? '2px 0 6px 20px' : '8px';
  container.style.margin = nested ? '0' : '';
}
