"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { useNotificationHub } from "../hooks/useNotificationHub";
import { getToken } from "../utils/storage";

function NotificationHubListener() {
  useNotificationHub();
  return null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setReady(true);
  }, [router]);

  if (!ready) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <NotificationHubListener />
      <Navbar />

      <main className="min-h-[calc(100vh-4rem)] lg:ml-64">{children}</main>
    </div>
  );
}
