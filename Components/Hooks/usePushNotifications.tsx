import { useCallback, useEffect, useState } from "react";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";

// atob/btoa-free base64url -> Uint8Array, needed because
// PushManager.subscribe() wants applicationServerKey as raw bytes but the
// backend hands us VAPID_PUBLIC_KEY as the base64url string web-push uses
// (see Lib/Env.ts on noyanai-back).
const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i)
    outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
};

export type PushSupportState =
  | "unsupported"
  | "checking"
  | "supported";

// Registers /service-worker.js and exposes the enable/disable push
// notifications toggle used by
// Components/Notification/PushNotificationToggle.tsx. Doesn't require the
// user to be logged in to register the worker or check permission - only
// subscribe()/unsubscribe() hit the (auth-gated) /user/push/* endpoints, so
// callers should gate those behind useUser() the same way
// Components/Layout/NotificationButton.tsx does.
const usePushNotifications = () => {
  const [support, setSupport] = useState<PushSupportState>("checking");
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification === "undefined" ? "denied" : Notification.permission,
  );
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      typeof Notification === "undefined"
    ) {
      setSupport("unsupported");
      return;
    }
    let cancelled = false;
    navigator.serviceWorker
      .register("/service-worker.js")
      .then(async (reg) => {
        if (cancelled) return;
        setRegistration(reg);
        setSupport("supported");
        const existing = await reg.pushManager.getSubscription();
        if (!cancelled) setIsSubscribed(!!existing);
      })
      .catch((err) => {
        console.error("Failed to register service worker:", err);
        if (!cancelled) setSupport("unsupported");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!registration) return false;
    setIsLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") return false;

      const { data } = await fetcher<{ data: { publicKey: string } }>({
        url: `${API}/user/push/publicKey`,
      });
      if (!data.publicKey)
        throw new Error("Push is not configured on the server");

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(data.publicKey),
      });
      const json = subscription.toJSON();
      await fetcher({
        url: `${API}/user/push/subscribe`,
        method: "POST",
        payload: {
          endpoint: json.endpoint,
          keys: json.keys,
          userAgent: navigator.userAgent,
        },
      });
      setIsSubscribed(true);
      return true;
    } catch (err) {
      console.error("Failed to subscribe to push notifications:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [registration]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!registration) return false;
    setIsLoading(true);
    try {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        await fetcher({
          url: `${API}/user/push/unsubscribe`,
          method: "POST",
          payload: { endpoint },
        });
      }
      setIsSubscribed(false);
      return true;
    } catch (err) {
      console.error("Failed to unsubscribe from push notifications:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [registration]);

  return { support, permission, isSubscribed, isLoading, subscribe, unsubscribe };
};

export default usePushNotifications;
