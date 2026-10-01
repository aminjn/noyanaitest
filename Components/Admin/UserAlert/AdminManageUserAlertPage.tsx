"use client";

import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import NodeManager from "../UI/NodeManger";
import {
  FullUserAlert,
  userAlertEventLabels,
  userAlertEvents,
} from "./AdminManageUserAlertsPage";
import { ta } from "@/Components/Admin/i18n/adminText";
import { displayPhone } from "../User/userShared";

// The toggles grouped by channel (push, SMS), each titled by its event only,
// built at render so the labels are in the panel's language.
const groupedToggles = () => {
  const renderer: Record<string, unknown> = {};
  for (const event of userAlertEvents) {
    const suffix = event.charAt(0).toUpperCase() + event.slice(1);
    const label = userAlertEventLabels[event];
    renderer[`pushNotificationOn${suffix}`] = {
      type: "bool",
      title: label,
      section: ta("پوش نوتیفیکیشن"),
    };
  }
  for (const event of userAlertEvents) {
    const suffix = event.charAt(0).toUpperCase() + event.slice(1);
    const label = userAlertEventLabels[event];
    renderer[`sendSMSOn${suffix}`] = {
      type: "bool",
      title: label,
      section: ta("پیامک"),
    };
  }
  return renderer;
};

const AdminManageUserAlertPage = () => {
  return (
    <NodeManager<FullUserAlert>
      deleteBackTo="/messaging?tab=alerts"
      modelName="userAlert"
      getTitle={(node) =>
        ta("تنظیمات اطلاع‌رسانی ${1}", [
          node.user?.phone ? displayPhone(node.user.phone) : ta("بدون نام"),
        ])
      }
      content={({ mutate, node }) => (
        <CreateForm
          layout="sections"
          defaultValue={node}
          renderer={{
            user: {
              type: "users",
              title: ta("کاربر"),
              getDefaultValue: (inp) => inp.user,
              readOnly: true,
              required: true,
            },
            ...groupedToggles(),
          }}
          hookProps={{
            path: `${API}/auto/userAlert/${node._id}`,
            method: "POST",
            successCb: () => {
              mutate();
            },
          }}
        />
      )}
    />
  );
};

export default AdminManageUserAlertPage;
