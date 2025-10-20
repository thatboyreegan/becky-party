import crypto from "crypto";
import { prisma } from "~/utils/db.server";

/**
 *
 * @param length number of characters in the token
 * @returns a random token
 */
export function generateToken(length = 32) {
  return crypto.randomBytes(length).toString("hex");
}

/**
 *
 * @param name name of guest
 * @param phoneNumber telephone number associated with user
 * @returns a guest object already created in the db
 */
export async function createGuestWithToken(
  name: string,
  phoneNumber: string,
  hostId: number
) {
  const uniqueToken = generateToken();
  const guest = await prisma.guest.create({
    data: { name, phoneNumber, uniqueToken, hostId },
  });

  return guest;
}

export async function validateToken(uniqueToken: string | undefined) {
  const guest = await prisma.guest.findUnique({
    where: { uniqueToken },
  });

  return guest || null;
}
