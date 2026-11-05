export function tooltip({ properties: p }) {
  const content = document.createElement('div');
  content.style.whiteSpace = 'pre-line';
  let text = p.name ? String(p.name) : '';
  if (p.departure) text += `${text ? '\n' : ''}Departure ${p.departure} ${p.timetable.timeZone}`;
  if (p.description) text += `${text ? '\n' : ''}${p.description}`;
  content.textContent = text;
  return content;
}
