"use client";

import { useState } from "react";
import styles from "./EmployeeDashboard.module.css";
import { addGoal, removeGoal, submitGoalSheet, updateCheckIn } from "@/app/actions";

export default function EmployeeDashboard({ user, goalSheet }: { user: any; goalSheet: any }) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalWeightage = goalSheet.goals.reduce((acc: number, g: any) => acc + g.weightage, 0);
  const isEditable = goalSheet.status === "DRAFT" || goalSheet.status === "RETURNED";
  const isApproved = goalSheet.status === "APPROVED";

  const handleAddGoal = async (formData: FormData) => {
    setError("");
    try {
      await addGoal(formData);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      await submitGoalSheet(goalSheet.id);
    } catch (e: any) {
      setError(e.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>My Goal Sheet</h1>
        <div className={styles.statusBadge} data-status={goalSheet.status}>
          {goalSheet.status}
        </div>
      </header>

      {error && <div className={styles.errorAlert}>{error}</div>}

      <div className={styles.summaryCard}>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Cycle Year</span>
          <span className={styles.statValue}>{goalSheet.cycleYear}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Total Weightage</span>
          <span className={`${styles.statValue} ${totalWeightage === 100 ? styles.successText : styles.warningText}`}>
            {totalWeightage}%
          </span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Goals</span>
          <span className={styles.statValue}>{goalSheet.goals.length} / 8</span>
        </div>
      </div>

      <div className={styles.goalsSection}>
        <div className={styles.goalsHeader}>
          <h2>Goals</h2>
          {isEditable && (
            <button className={styles.submitBtn} onClick={handleSubmit} disabled={isSubmitting || totalWeightage !== 100}>
              {isSubmitting ? "Submitting..." : "Submit for Approval"}
            </button>
          )}
        </div>

        <div className={styles.grid}>
          {goalSheet.goals.map((goal: any) => (
            <div key={goal.id} className={styles.goalCard}>
              <div className={styles.goalTop}>
                <span className={styles.thrustArea}>{goal.thrustArea}</span>
                <span className={styles.weightageBadge}>{goal.weightage}%</span>
              </div>
              <h3 className={styles.goalTitle}>{goal.title}</h3>
              <p className={styles.goalDesc}>{goal.description}</p>
              
              <div className={styles.targetBox}>
                <span>Target: <strong>{goal.target}</strong> ({goal.uom})</span>
              </div>

              {isEditable && !goal.isShared && (
                <button onClick={() => removeGoal(goal.id)} className={styles.deleteBtn}>Remove Goal</button>
              )}

              {isApproved && (
                <CheckInForm goal={goal} />
              )}
            </div>
          ))}
        </div>
      </div>

      {isEditable && goalSheet.goals.length < 8 && (
        <div className={styles.addGoalSection}>
          <h2>Add New Goal</h2>
          <form action={handleAddGoal} className={styles.form}>
            <input type="hidden" name="goalSheetId" value={goalSheet.id} />
            
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label>Thrust Area</label>
                <input name="thrustArea" required placeholder="e.g., Financial, Customer" />
              </div>
              <div className={styles.inputGroup}>
                <label>Title</label>
                <input name="title" required placeholder="Goal Title" />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Description</label>
              <textarea name="description" rows={2} placeholder="Optional details..." />
            </div>

            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label>Unit of Measurement (UoM)</label>
                <select name="uom" required>
                  <option value="NUMERIC">Numeric</option>
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="TIMELINE">Timeline (Date)</option>
                  <option value="ZERO_BASED">Zero-based</option>
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label>Target</label>
                <input name="target" type="number" step="any" required placeholder="e.g., 1000" />
              </div>
              <div className={styles.inputGroup}>
                <label>Weightage (%)</label>
                <input name="weightage" type="number" step="0.1" min="10" max="100" required placeholder="Min 10" />
              </div>
            </div>

            <button type="submit" className={styles.addBtn}>+ Add Goal</button>
          </form>
        </div>
      )}
    </div>
  );
}

function CheckInForm({ goal }: { goal: any }) {
  const [quarter, setQuarter] = useState("Q1");
  const [achievement, setAchievement] = useState("");
  const [status, setStatus] = useState("NOT_STARTED");
  const [saving, setSaving] = useState(false);

  // Find existing checkIn for selected quarter
  const existingCheckIn = goal.checkIns.find((c: any) => c.quarter === quarter);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateCheckIn(goal.id, quarter, parseFloat(achievement), status);
    setSaving(false);
  };

  return (
    <div className={styles.checkInSection}>
      <h4>Quarterly Update</h4>
      <form onSubmit={handleSave} className={styles.checkInForm}>
        <select value={quarter} onChange={(e) => setQuarter(e.target.value)} className={styles.selectSm}>
          <option value="Q1">Q1 Update</option>
          <option value="Q2">Q2 Update</option>
          <option value="Q3">Q3 Update</option>
          <option value="Q4">Q4 / Annual</option>
        </select>
        
        <input 
          type="number" 
          placeholder="Actual" 
          value={achievement} 
          onChange={(e) => setAchievement(e.target.value)} 
          className={styles.inputSm}
          required
        />
        
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={styles.selectSm}>
          <option value="NOT_STARTED">Not Started</option>
          <option value="ON_TRACK">On Track</option>
          <option value="COMPLETED">Completed</option>
        </select>
        
        <button type="submit" className={styles.saveBtn} disabled={saving}>
          {saving ? "..." : "Save"}
        </button>
      </form>
      {existingCheckIn && existingCheckIn.managerComment && (
        <div className={styles.managerComment}>
          <strong>Manager feedback:</strong> {existingCheckIn.managerComment}
        </div>
      )}
    </div>
  );
}
