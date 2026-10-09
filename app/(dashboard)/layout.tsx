"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Navbar from "../components/Navbar";
import { useNotificationHub } from "../hooks/useNotificationHub";
import { logout } from "../store/authSlice";
import { isTokenExpired } from "../utils/jwt";
import { forceLogoutToLogin } from "../utils/session";
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
  const dispatch = useDispatch();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();

    if (!token || isTokenExpired(token)) {
      dispatch(logout());
      forceLogoutToLogin();
      return;
    }

    setReady(true);
  }, [dispatch]);

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
