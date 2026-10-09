"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { logout, setAuthToken } from "./authSlice";
import { store } from "./store";
import { isTokenExpired } from "../utils/jwt";
import { forceLogoutToLogin } from "../utils/session";
import { getToken } from "../utils/storage";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const token = getToken();

    if (!token) return;

    if (isTokenExpired(token)) {
      store.dispatch(logout());
      forceLogoutToLogin();
      return;
    }

    store.dispatch(setAuthToken(token));
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
