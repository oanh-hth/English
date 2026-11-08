export function welcome(name: string): string {
  const who = name.trim() || 'friend';
  return `Welcome to the nook, ${who}!`;
}
