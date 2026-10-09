export function toKobo(naira: number | string): number {
  const parsed = Number(naira);
  if (isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
}

export function fromKobo(kobo: number | string): number {
  const parsed = Number(kobo);
  if (isNaN(parsed)) return 0;
  return parsed / 100;
}
