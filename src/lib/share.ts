import type { GuessFeedback, FeedbackType } from '../types';

const EMOJI_MAP: Record<FeedbackType, string> = {
  match: '\u{1F7E9}',
  partial: '\u{1F7E8}',
  wrong: '\u2B1B',
  higher: '\u2B1C',
  lower: '\u2B1C',
};

export function generateShareString(
  guesses: GuessFeedback[],
  dailyNumber: number
): string {
  const header = `D&Dle #${dailyNumber} \u2014 ${guesses.length}/\u221E`;

  const rows = guesses.map(guess => {
    const cells = guess.cells;
    return [
      cells.size, cells.type, cells.cr, cells.alignment,
      cells.biome, cells.movement, cells.senses,
    ]
      .map(cell => EMOJI_MAP[cell.feedback])
      .join('');
  });

  return [header, ...rows].join('\n');
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
