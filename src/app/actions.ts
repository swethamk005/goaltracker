"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function addGoal(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const goalSheetId = formData.get("goalSheetId") as string;
  const thrustArea = formData.get("thrustArea") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const uom = formData.get("uom") as string;
  const target = parseFloat(formData.get("target") as string);
  const weightage = parseFloat(formData.get("weightage") as string);

  if (weightage < 10) throw new Error("Minimum weightage is 10%");

  const goalSheet = await prisma.goalSheet.findUnique({
    where: { id: goalSheetId },
    include: { goals: true },
  });

  if (!goalSheet) throw new Error("Goal Sheet not found");
  if (goalSheet.status !== "DRAFT" && goalSheet.status !== "RETURNED") {
    throw new Error("Cannot add goals unless in Draft or Returned status");
  }
  if (goalSheet.goals.length >= 8) {
    throw new Error("Maximum of 8 goals allowed");
  }

  const currentTotalWeightage = goalSheet.goals.reduce((acc, g) => acc + g.weightage, 0);
  if (currentTotalWeightage + weightage > 100) {
    throw new Error("Total weightage cannot exceed 100%");
  }

  await prisma.goal.create({
    data: {
      goalSheetId,
      thrustArea,
      title,
      description,
      uom,
      target,
      weightage,
    },
  });

  revalidatePath("/dashboard");
}

export async function removeGoal(goalId: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  await prisma.goal.delete({ where: { id: goalId } });
  revalidatePath("/dashboard");
}

export async function submitGoalSheet(goalSheetId: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const goalSheet = await prisma.goalSheet.findUnique({
    where: { id: goalSheetId },
    include: { goals: true },
  });

  if (!goalSheet) throw new Error("Not found");
  const currentTotalWeightage = goalSheet.goals.reduce((acc, g) => acc + g.weightage, 0);
  
  if (currentTotalWeightage !== 100) {
    throw new Error("Total weightage must be exactly 100%");
  }

  await prisma.goalSheet.update({
    where: { id: goalSheetId },
    data: { status: "SUBMITTED" },
  });

  revalidatePath("/dashboard");
}

export async function updateCheckIn(goalId: string, quarter: string, achievement: number, status: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const existingCheckIn = await prisma.checkIn.findFirst({
    where: { goalId, quarter }
  });

  if (existingCheckIn) {
    await prisma.checkIn.update({
      where: { id: existingCheckIn.id },
      data: { actualAchievement: achievement, status }
    });
  } else {
    await prisma.checkIn.create({
      data: { goalId, quarter, actualAchievement: achievement, status }
    });
  }

  revalidatePath("/dashboard");
}

// Manager Actions
export async function approveGoalSheet(goalSheetId: string) {
  await prisma.goalSheet.update({
    where: { id: goalSheetId },
    data: { status: "APPROVED", lockDate: new Date() },
  });
  revalidatePath("/dashboard");
}

export async function returnGoalSheet(goalSheetId: string) {
  await prisma.goalSheet.update({
    where: { id: goalSheetId },
    data: { status: "RETURNED" },
  });
  revalidatePath("/dashboard");
}
