"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { logout } from "../store/authSlice";
import { decodeToken } from "../utils/jwt";
import { removeToken } from "../utils/storage";
import { RxHamburgerMenu } from "react-icons/rx";
import { FiLogOut } from "react-icons/fi";
import Sidebar from "./Sidebar";

const Navbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const dispatch = useDispatch();
  const router = useRouter();

  const token = useSelector((state: RootState) => state.auth.token);
  const user = token ? decodeToken(token) : null;

  const handleLogout = () => {
    removeToken();
    dispatch(logout());
    router.replace("/login");
  };

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-(--card-background)/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--primary) text-lg font-bold text-white">
              T
            </div>

            <h1 className="text-xl font-bold tracking-tight text-(--text-primary)">
              Task<span className="text-(--primary)">Flow</span>
            </h1>

            {/* Hamburger */}
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="ml-5 rounded-md p-2 transition hover:bg-gray-100"
              aria-label="Toggle sidebar"
            >
              <RxHamburgerMenu className="h-5 w-5 cursor-pointer text-(--text-primary)" />
            </button>
          </div>

          {/* User */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-xs text-(--text-secondary)">Welcome back</p>

                <p className="text-sm font-semibold text-(--text-primary)">
                  {user.name}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--primary) text-sm font-semibold text-white">
                {user.name?.charAt(0).toUpperCase()}
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md p-2 text-(--text-secondary) transition hover:bg-gray-100 hover:text-(--text-primary)"
                aria-label="Log out"
                title="Log out"
              >
                <FiLogOut className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
};

export default Navbar;
