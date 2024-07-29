import { randomBytes } from 'node:crypto';

/**
 * Generates a unique code.
 * @param length The length of the code to generate.
 * @returns A unique code.
 */
export function generateUniqueCode(length: number = 6): string {
  return randomBytes(length).toString('hex').substring(0, length);
}
