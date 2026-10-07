"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { setAuthToken } from "./authSlice";
import { store } from "./store";
import { getToken } from "../utils/storage";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const token = getToken();

    if (token) {
      store.dispatch(setAuthToken(token));
    }
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
