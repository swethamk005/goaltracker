"use client";

import { useState } from "react";
import styles from "./AdminDashboard.module.css";
import { pushSharedGoal } from "@/app/actions2";

export default function AdminDashboard({ user, allGoalSheets }: { user: any; allGoalSheets: any[] }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const totalSheets = allGoalSheets.length;
  const submittedSheets = allGoalSheets.filter((s) => s.status !== "DRAFT").length;
  const approvedSheets = allGoalSheets.filter((s) => s.status === "APPROVED").length;

  const handlePushSharedGoal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    const formData = new FormData(e.currentTarget);
    try {
      await pushSharedGoal(
        formData.get("thrustArea") as string,
        formData.get("title") as string,
        formData.get("description") as string,
        formData.get("uom") as string,
        parseFloat(formData.get("target") as string)
      );
      setSuccess("Shared goal pushed to all draft goal sheets!");
      e.currentTarget.reset();
    } catch (err: any) {
      alert(err.message);
    }
    setLoading(false);
  };

  const handleExportCSV = () => {
    // Generate CSV string
    const headers = ["Employee", "Email", "Goal Title", "Thrust Area", "Target", "UoM", "Weightage", "Q1 Actual", "Q2 Actual", "Q3 Actual", "Q4 Actual"];
    const rows = [headers.join(",")];

    allGoalSheets.forEach(sheet => {
      if (sheet.status === "APPROVED") {
        sheet.goals.forEach((goal: any) => {
          const getCheckIn = (q: string) => {
            const ci = goal.checkIns.find((c: any) => c.quarter === q);
            return ci ? ci.actualAchievement || 0 : "N/A";
          };
          const row = [
            `"${sheet.user.name}"`,
            `"${sheet.user.email}"`,
            `"${goal.title}"`,
            `"${goal.thrustArea}"`,
            goal.target,
            `"${goal.uom}"`,
            goal.weightage,
            getCheckIn("Q1"),
            getCheckIn("Q2"),
            getCheckIn("Q3"),
            getCheckIn("Q4")
          ];
          rows.push(row.join(","));
        });
      }
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "goal_achievements.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 className={styles.title}>Admin Dashboard</h1>
            <p className={styles.subtitle}>Organization overview and governance</p>
          </div>
          <button onClick={handleExportCSV} className={styles.btnPrimary}>
            Export Achievement CSV
          </button>
        </div>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Goal Sheets</h3>
          <p className={styles.statNumber}>{totalSheets}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Submitted</h3>
          <p className={styles.statNumber}>{submittedSheets}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Approved</h3>
          <p className={styles.statNumber}>{approvedSheets}</p>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.card}>
          <h2>Completion Status</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Manager</th>
                  <th>Status</th>
                  <th>Total Goals</th>
                </tr>
              </thead>
              <tbody>
                {allGoalSheets.map((sheet) => (
                  <tr key={sheet.id}>
                    <td>{sheet.user.name}</td>
                    <td>{sheet.user.managerId || "N/A"}</td>
                    <td>
                      <span className={styles.badge} data-status={sheet.status}>
                        {sheet.status}
                      </span>
                    </td>
                    <td>{sheet.goals.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.card}>
          <h2>Push Shared Goal (Bonus)</h2>
          <p className={styles.cardDesc}>This goal will be added to all Goal Sheets that are in Draft or Returned state.</p>
          
          {success && <div className={styles.successAlert}>{success}</div>}
          
          <form onSubmit={handlePushSharedGoal} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Thrust Area</label>
              <input name="thrustArea" required placeholder="e.g., Organizational" />
            </div>
            <div className={styles.inputGroup}>
              <label>Title</label>
              <input name="title" required placeholder="Shared Goal Title" />
            </div>
            <div className={styles.inputGroup}>
              <label>Description</label>
              <input name="description" placeholder="Description" />
            </div>
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label>UoM</label>
                <select name="uom" required>
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="NUMERIC">Numeric</option>
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label>Target</label>
                <input name="target" type="number" required placeholder="Target" />
              </div>
            </div>
            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              {loading ? "Pushing..." : "Push Shared Goal"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
