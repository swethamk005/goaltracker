import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import EmployeeDashboard from "@/components/EmployeeDashboard";
import ManagerDashboard from "@/components/ManagerDashboard";
import AdminDashboard from "@/components/AdminDashboard";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      goalSheets: {
        where: { cycleYear: new Date().getFullYear() },
        include: { goals: { include: { checkIns: true } } },
      },
    },
  });

  if (!user) return <div>User not found</div>;

  const currentYear = new Date().getFullYear();
  let goalSheet = user.goalSheets[0];

  if (!goalSheet && user.role === "EMPLOYEE") {
    // Create draft goal sheet for employee
    goalSheet = await prisma.goalSheet.create({
      data: {
        userId: user.id,
        cycleYear: currentYear,
        status: "DRAFT",
      },
      include: { goals: { include: { checkIns: true } } },
    });
  }

  let teamGoalSheets: any[] = [];
  if (user.role === "MANAGER") {
    teamGoalSheets = await prisma.goalSheet.findMany({
      where: { user: { managerId: user.id } },
      include: { 
        user: true, 
        goals: { include: { checkIns: true } } 
      },
    });
  }

  let allGoalSheets: any[] = [];
  if (user.role === "ADMIN") {
    allGoalSheets = await prisma.goalSheet.findMany({
      include: { 
        user: true, 
        goals: { include: { checkIns: true } } 
      },
    });
  }

  return (
    <div>
      {user.role === "EMPLOYEE" && <EmployeeDashboard user={user} goalSheet={goalSheet} />}
      {user.role === "MANAGER" && <ManagerDashboard user={user} teamGoalSheets={teamGoalSheets} />}
      {user.role === "ADMIN" && <AdminDashboard user={user} allGoalSheets={allGoalSheets} />}
    </div>
  );
}
