export function compassOrientation(event) {
  const handler = this.handler;
  const bearing = Number.isFinite(event.webkitCompassHeading) ? -event.webkitCompassHeading : event.alpha;
  const orientation = event.absolute ? 0 : (screen.orientation?.angle ?? window.orientation ?? 0);
  if (Number.isFinite(bearing)) handler._map.setBearing(bearing - orientation);
}
