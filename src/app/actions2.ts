"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function addManagerComment(checkInId: string, comment: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "MANAGER") throw new Error("Unauthorized");

  await prisma.checkIn.update({
    where: { id: checkInId },
    data: { managerComment: comment }
  });

  revalidatePath("/dashboard");
}

export async function pushSharedGoal(thrustArea: string, title: string, description: string, uom: string, target: number) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized");

  // Push to all DRAFT/RETURNED goal sheets
  const goalSheets = await prisma.goalSheet.findMany({
    where: { status: { in: ["DRAFT", "RETURNED"] } }
  });

  for (const gs of goalSheets) {
    await prisma.goal.create({
      data: {
        goalSheetId: gs.id,
        thrustArea,
        title,
        description,
        uom,
        target,
        weightage: 10, // Default minimum weightage
        isShared: true,
      }
    });
  }

  revalidatePath("/dashboard");
}
