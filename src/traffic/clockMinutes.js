

export function clockMinutes(clockTime) {
  const parts = clockTime.split(':');
  return Number(parts[0]) * 60 + Number(parts[1]);
}
