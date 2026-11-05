export function shouldSkipOther(other, layer) {
  return other === layer || other._type === 'terrain' || other._type === 'traffic';
}
