import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--background)" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "3rem", overflowY: "auto", maxWidth: "1400px", margin: "0 auto" }}>
        {children}
      </main>
    </div>
  );
}
