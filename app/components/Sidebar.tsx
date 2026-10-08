"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { MdDashboard, MdFolder, MdClose, MdPeople } from "react-icons/md";
import type { RootState } from "../store/store";
import { decodeToken } from "../utils/jwt";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const pathname = usePathname();
  const token = useSelector((state: RootState) => state.auth.token);
  const role = token ? decodeToken(token).role : null;

  const links = [
    {
      name: "Dashboard",
      href: "/",
      icon: MdDashboard,
    },
    {
      name: "Projects",
      href: "/projects",
      icon: MdFolder,
    },
    ...(role === "Admin"
      ? [
          {
            name: "Users",
            href: "/users",
            icon: MdPeople,
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && <div onClick={onClose} />}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64
          border-r border-gray-200 bg-(--card-background)
          shadow-lg
          transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <span className="font-semibold text-(--text-primary)">Menu</span>

          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-gray-100"
          >
            <MdClose className="text-xl text-(--text-secondary)" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 p-4">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => {
                  // Keep sidebar open on desktop; close only on small screens
                  if (window.matchMedia("(max-width: 1023px)").matches) {
                    onClose();
                  }
                }}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition
                  ${
                    active
                      ? "bg-(--primary)/10 text-(--primary)"
                      : "text-(--text-secondary) hover:bg-gray-100 hover:text-(--text-primary)"
                  }
                `}
              >
                <Icon className="text-xl" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
