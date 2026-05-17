"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./login.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const handleDemoLogin = async (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword("password123");
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <Image src="/logo.png" alt="GoalVerse Logo" width={64} height={64} className={styles.logoImage} />
          </div>
          <h1 className={styles.title}>GoalVerse Portal</h1>
          <p className={styles.subtitle}>Sign in to manage your goals</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
            />
          </div>
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className={styles.demoSection}>
          <p className={styles.demoText}>Demo Accounts:</p>
          <div className={styles.demoButtons}>
            <button type="button" onClick={() => handleDemoLogin("employee@goalverse.com")} className={styles.demoBtn}>Employee</button>
            <button type="button" onClick={() => handleDemoLogin("manager@goalverse.com")} className={styles.demoBtn}>Manager</button>
            <button type="button" onClick={() => handleDemoLogin("admin@goalverse.com")} className={styles.demoBtn}>Admin</button>
          </div>
        </div>
      </div>
      <div className={styles.background}></div>
    </div>
  );
}
