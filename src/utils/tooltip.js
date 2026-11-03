export const tooltip = ({ properties: p }) => {
  const content = document.createElement('div');
  content.style.whiteSpace = 'pre-line';
  content.textContent = [p.name, p.departure && `Departure ${p.departure} ${p.timetable.timeZone}`, p.description].filter(Boolean).join('\n');
  return content;
};
