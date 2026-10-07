"use client";
import Navbar from "../components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="min-h-[calc(100vh-4rem)] lg:ml-64">{children}</main>
    </div>
  );
}
