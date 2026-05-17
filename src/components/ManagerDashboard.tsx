"use client";

import { useState } from "react";
import styles from "./ManagerDashboard.module.css";
import { approveGoalSheet, returnGoalSheet } from "@/app/actions";
import { addManagerComment } from "@/app/actions2";

export default function ManagerDashboard({ user, teamGoalSheets }: { user: any; teamGoalSheets: any[] }) {
  const [loadingId, setLoadingId] = useState("");

  const handleApprove = async (id: string) => {
    setLoadingId(id);
    await approveGoalSheet(id);
    setLoadingId("");
  };

  const handleReturn = async (id: string) => {
    setLoadingId(id);
    await returnGoalSheet(id);
    setLoadingId("");
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Manager Dashboard</h1>
        <p className={styles.subtitle}>Review your team's goals and check-ins</p>
      </header>

      <div className={styles.teamList}>
        {teamGoalSheets.length === 0 && <p className={styles.emptyState}>No team members found.</p>}
        {teamGoalSheets.map((sheet) => (
          <div key={sheet.id} className={styles.sheetCard}>
            <div className={styles.sheetHeader}>
              <div className={styles.employeeInfo}>
                <h3 className={styles.employeeName}>{sheet.user.name}</h3>
                <span className={styles.employeeEmail}>{sheet.user.email}</span>
              </div>
              <div className={styles.statusSection}>
                <span className={styles.statusBadge} data-status={sheet.status}>{sheet.status}</span>
                {sheet.status === "SUBMITTED" && (
                  <div className={styles.actions}>
                    <button 
                      onClick={() => handleReturn(sheet.id)} 
                      className={styles.returnBtn}
                      disabled={loadingId === sheet.id}
                    >
                      Return
                    </button>
                    <button 
                      onClick={() => handleApprove(sheet.id)} 
                      className={styles.approveBtn}
                      disabled={loadingId === sheet.id}
                    >
                      Approve
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.goalsList}>
              {sheet.goals.map((goal: any) => (
                <div key={goal.id} className={styles.goalItem}>
                  <div className={styles.goalHeader}>
                    <h4>{goal.title}</h4>
                    <span className={styles.weightage}>{goal.weightage}%</span>
                  </div>
                  <div className={styles.goalDetails}>
                    <span><strong>Target:</strong> {goal.target} {goal.uom}</span>
                  </div>
                  
                  {/* Quarterly Check-ins Section */}
                  {sheet.status === "APPROVED" && goal.checkIns.length > 0 && (
                    <div className={styles.checkIns}>
                      <h5>Quarterly Updates</h5>
                      {goal.checkIns.map((ci: any) => (
                        <div key={ci.id} className={styles.checkInItem}>
                          <div className={styles.ciHeader}>
                            <strong>{ci.quarter}</strong> - Actual: {ci.actualAchievement} 
                            <span className={styles.ciStatus} data-status={ci.status}>{ci.status}</span>
                          </div>
                          <ManagerCommentForm checkIn={ci} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ManagerCommentForm({ checkIn }: { checkIn: any }) {
  const [comment, setComment] = useState(checkIn.managerComment || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await addManagerComment(checkIn.id, comment);
    setSaving(false);
  };

  return (
    <form onSubmit={handleSave} className={styles.commentForm}>
      <input 
        type="text" 
        placeholder="Add structured feedback..." 
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className={styles.commentInput}
      />
      <button type="submit" className={styles.commentSaveBtn} disabled={saving}>
        {saving ? "Saving..." : "Save Feedback"}
      </button>
    </form>
  );
}
