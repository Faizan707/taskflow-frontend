import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import type { NotificationItem } from "../types/notification";

export function getHubBaseUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5017/api";
  return apiUrl.replace(/\/api\/?$/, "");
}

type NotificationHandler = (notification: NotificationItem) => void;

let sharedConnection: HubConnection | null = null;
let sharedToken: string | null = null;
let startPromise: Promise<void> | null = null;
const handlers = new Set<NotificationHandler>();

function createConnection(token: string) {
  return new HubConnectionBuilder()
    .withUrl(`${getHubBaseUrl()}/hubs/notifications`, {
      accessTokenFactory: () => token,
    })
    .withAutomaticReconnect()
    // Avoid Next.js error overlay from SignalR's internal console.error logs
    .configureLogging(LogLevel.None)
    .build();
}

async function ensureStarted(token: string) {
  if (
    sharedConnection &&
    sharedToken === token &&
    sharedConnection.state === HubConnectionState.Connected
  ) {
    return;
  }

  if (
    sharedConnection &&
    sharedToken === token &&
    startPromise
  ) {
    await startPromise;
    return;
  }

  if (sharedConnection) {
    try {
      await sharedConnection.stop();
    } catch {
      // ignore
    }
    sharedConnection = null;
    startPromise = null;
  }

  sharedToken = token;
  const connection = createConnection(token);
  sharedConnection = connection;

  connection.on("ReceiveNotification", (notification: NotificationItem) => {
    handlers.forEach((handler) => handler(notification));
  });

  startPromise = connection
    .start()
    .then(() => undefined)
    .catch((error) => {
      const message = String(error?.message ?? error).toLowerCase();
      const benign =
        message.includes("stopped during negotiation") ||
        message.includes("connection was stopped") ||
        message.includes("abort");

      if (!benign) {
        console.warn("SignalR connection failed:", error);
      }

      if (sharedConnection === connection) {
        sharedConnection = null;
        startPromise = null;
      }
    });

  await startPromise;
}

export async function subscribeNotifications(
  token: string,
  handler: NotificationHandler
) {
  handlers.add(handler);
  await ensureStarted(token);

  return () => {
    handlers.delete(handler);
  };
}
