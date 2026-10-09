"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FiBell } from "react-icons/fi";
import {
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "../services/api";

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const { data: unread } = useGetUnreadNotificationCountQuery();
  const { data: notifications = [], isLoading } = useGetNotificationsQuery(
    undefined,
    { skip: !open }
  );
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] =
    useMarkAllNotificationsReadMutation();

  const unreadCount = unread?.count ?? 0;

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleOpenNotification = async (id: number, isRead: boolean) => {
    if (!isRead) {
      try {
        await markRead(id).unwrap();
      } catch {
        // keep panel usable even if mark-read fails
      }
    }

    setOpen(false);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative rounded-md p-2 text-(--text-secondary) transition hover:bg-gray-100 hover:text-(--text-primary)"
        aria-label="Notifications"
        title="Notifications"
      >
        <FiBell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-[70] mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-(--card-background) shadow-xl sm:w-96">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <h3 className="text-sm font-semibold text-(--text-primary)">
              Notifications
            </h3>
            <button
              type="button"
              onClick={() => markAllRead()}
              disabled={isMarkingAll || unreadCount === 0}
              className="text-xs font-medium text-(--primary) hover:underline disabled:opacity-50"
            >
              Mark all read
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <p className="px-4 py-8 text-center text-sm text-(--text-secondary)">
                Loading...
              </p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-(--text-secondary)">
                No notifications yet.
              </p>
            ) : (
              notifications.map((item) => {
                const content = (
                  <>
                    <p
                      className={`text-sm ${
                        item.isRead
                          ? "text-(--text-secondary)"
                          : "font-medium text-(--text-primary)"
                      }`}
                    >
                      {item.message}
                    </p>
                    <p className="mt-1 text-[11px] text-(--text-muted)">
                      {formatTime(item.createdAt)}
                    </p>
                  </>
                );

                if (item.projectId) {
                  return (
                    <Link
                      key={item.id}
                      href={`/projects/${item.projectId}`}
                      onClick={() =>
                        handleOpenNotification(item.id, item.isRead)
                      }
                      className={`block border-b border-gray-100 px-4 py-3 transition hover:bg-gray-50 ${
                        item.isRead ? "" : "bg-(--primary)/5"
                      }`}
                    >
                      {content}
                    </Link>
                  );
                }

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      handleOpenNotification(item.id, item.isRead)
                    }
                    className={`block w-full border-b border-gray-100 px-4 py-3 text-left transition hover:bg-gray-50 ${
                      item.isRead ? "" : "bg-(--primary)/5"
                    }`}
                  >
                    {content}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
