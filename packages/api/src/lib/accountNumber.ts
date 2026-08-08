import { prisma } from "@meridian/db";

/**
 * Generates a 10-digit account number:
 *   - first 9 digits are random
 *   - last digit is a Luhn checksum digit
 * This means a single mistyped digit (or common transpositions) is
 * almost always catchable client-side before ever hitting the database.
 */
function luhnChecksum(digits: string): number {
  let sum = 0;
  let shouldDouble = true; // start doubling from the rightmost digit of the base
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10);
    if (shouldDouble) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    shouldDouble = !shouldDouble;
  }
  return (10 - (sum % 10)) % 10;
}

function randomDigits(length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += Math.floor(Math.random() * 10).toString();
  }
  return out;
}

export function isValidAccountNumber(accountNumber: string): boolean {
  if (!/^\d{10}$/.test(accountNumber)) return false;
  const base = accountNumber.slice(0, 9);
  const check = parseInt(accountNumber[9], 10);
  return luhnChecksum(base) === check;
}

/**
 * Generates a unique account number, retrying on the (very rare)
 * chance of a collision against existing accounts.
 */
export async function generateUniqueAccountNumber(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const base = randomDigits(9);
    const check = luhnChecksum(base);
    const candidate = `${base}${check}`;

    const existing = await prisma.account.findUnique({
      where: { accountNumber: candidate },
      select: { id: true },
    });

    if (!existing) return candidate;
  }
  throw new Error("Failed to generate a unique account number after 10 attempts");
}
