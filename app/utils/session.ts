import { stopNotificationHub } from "./signalr";
import { removeToken } from "./storage";

let loggingOut = false;

/** Clears auth and sends the user to login without surfacing API errors. */
export function forceLogoutToLogin() {
  if (typeof window === "undefined" || loggingOut) return;

  loggingOut = true;
  removeToken();
  void stopNotificationHub();
  window.location.replace("/login");
}
