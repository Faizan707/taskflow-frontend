"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { api } from "../services/api";
import type { RootState } from "../store/store";
import { subscribeNotifications } from "../utils/signalr";

export function useNotificationHub() {
  const token = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!token) return;

    let unsubscribe: (() => void) | undefined;
    let active = true;

    subscribeNotifications(token, (notification) => {
      dispatch(
        api.util.invalidateTags([
          { type: "Notification", id: "LIST" },
          { type: "Notification", id: "UNREAD" },
        ])
      );

      if (
        "Notification" in window &&
        window.Notification.permission === "granted"
      ) {
        new window.Notification("TaskFlow", {
          body: notification.message,
        });
      }
    }).then((fn) => {
      if (!active) {
        fn();
        return;
      }
      unsubscribe = fn;
    });

    return () => {
      active = false;
      unsubscribe?.();
      // Keep shared connection alive across Strict Mode remounts / navigations.
    };
  }, [token, dispatch]);
}
