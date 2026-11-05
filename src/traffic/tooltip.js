export function tooltip({ properties: p }) {
  const content = document.createElement('div');
  content.style.whiteSpace = 'pre-line';
  const lines = [];
  for (const line of [p.name, p.departure && `Departure ${p.departure} ${p.timetable.timeZone}`, p.description]) {
    if (line) lines.push(line);
  }
  content.textContent = lines.join('\n');
  return content;
}
