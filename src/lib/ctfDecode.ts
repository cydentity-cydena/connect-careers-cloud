// Runtime decode for CTF challenge data — prevents casual flag discovery in source
export const d = (encoded: string): string =>
  atob(encoded).split('').reverse().join('');
