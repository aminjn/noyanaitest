"use client";

import useLocale from "../Hooks/useLocale";
import useUser from "../Hooks/useUser";
import useNotification from "../Hooks/useNotification";
import usePushNotifications from "../Hooks/usePushNotifications";
import Button from "../UI/Button";
import Bell01Icon from "../Icons/Bell01Icon";

// Lets a logged-in user opt in/out of browser push notifications for their
// account (Components/Hooks/usePushNotifications.tsx does the actual
// service worker/PushManager work, backed by /user/push/* on
// noyanai-back). Lives on the notifications page - once subscribed, the
// service worker keeps receiving pushes regardless of which page is open,
// so there's no need to duplicate this control anywhere else.
const PushNotificationToggle = () => {
  const { user } = useUser();
  const getContent = useLocale();
  const pushNotification = useNotification();
  const {
    support,
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  if (!user || support !== "supported") return null;

  if (permission === "denied")
    return (
      <Button variant="Disable" mode="Outline" size="S" radius="High">
        {getContent("pushNotificationsBlocked")}
      </Button>
    );

  const toggle = async () => {
    const ok = isSubscribed ? await unsubscribe() : await subscribe();
    if (ok && !isSubscribed) pushNotification(getContent("pushNotificationsEnabled"), "Success");
    else if (!ok) pushNotification(getContent("pushSubscriptionFailed"), "Error");
  };

  return (
    <Button
      variant={isSubscribed ? "Secondary" : "Primary"}
      mode={isSubscribed ? "Outline" : "Fill"}
      size="S"
      radius="High"
      leadIcon={<Bell01Icon />}
      isLoading={isLoading}
      onClick={toggle}
    >
      {getContent(
        isSubscribed ? "disablePushNotifications" : "enablePushNotifications",
      )}
    </Button>
  );
};

export default PushNotificationToggle;
