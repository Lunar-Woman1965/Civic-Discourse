import { prisma } from "@/lib/db";

type CreateFounderNotificationInput = {
  type: string;
  title: string;
  message: string;
  link?: string | null;
  actorId?: string | null;
};

export async function createFounderNotification({
  type,
  title,
  message,
  link = null,
  actorId = null,
}: CreateFounderNotificationInput) {
  const founders = await prisma.user.findMany({
    where: {
      OR: [{ role: "PLATFORM_FOUNDER" }, { isFounder: true }],
    },
    select: {
      id: true,
    },
  });

  if (founders.length === 0) return;

  await prisma.notification.createMany({
    data: founders.map((founder) => ({
      userId: founder.id,
      actorId,
      type,
      title,
      message,
      link,
    })),
  });
}