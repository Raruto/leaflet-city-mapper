export function styleTimeControl(container, nested) {
  container.classList.toggle('leaflet-control', !nested);
  container.classList.toggle('leaflet-bar', !nested);
  Object.assign(container.style, nested
    ? { background: '', padding: '2px 0 6px 20px', margin: '0' }
    : { background: '#fff', padding: '8px', margin: '' });
}
