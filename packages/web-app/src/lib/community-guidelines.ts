export const BANNED_WORDS = ['badword1', 'badword2'];

export function checkAgainstGuidelines(text: string) {
  const violations = BANNED_WORDS.filter(word => new RegExp(`\\b${word}\\b`, 'i').test(text));
  return {
    valid: violations.length === 0,
    violations,
  };
}
