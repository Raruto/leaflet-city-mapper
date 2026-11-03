export const channel = (n, h, l, a) => {
  const k = (n + h * 12) % 12;
  return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
};
