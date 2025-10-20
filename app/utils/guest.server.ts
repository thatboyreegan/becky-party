import { prisma } from "~/utils/db.server";

export async function getGuests(hostId: number) {
  const guests = await prisma.guest.findMany({
    where: { hostId },
    orderBy: { creeatedAt: "desc" },
  });

  return guests;
}

export async function findGuest(
  name: string,
  phoneNumber: string,
  hostId: number
) {
  return await prisma.guest.findFirst({
    where: {
      hostId,
      OR: [{ name: { equals: name, mode: "insensitive" } }, { phoneNumber }],
    },
  });
}
