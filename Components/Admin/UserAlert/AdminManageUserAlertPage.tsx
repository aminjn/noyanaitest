"use client";

import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import NodeManager from "../UI/NodeManger";
import { IUser } from "@/Components/Hooks/useUser";
import { getUserLabel } from "../Lib/LabelGetters";
import { FullUserAlert, userAlertToggleFormRenderer } from "./AdminManageUserAlertsPage";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageUserAlertPage = () => {
  return (
    <NodeManager<FullUserAlert>
      modelName="userAlert"
      getTitle={(node) => getUserLabel(node.user)}
      content={({ mutate, node }) => (
        <CreateForm
          defaultValue={node}
          renderer={{
            user: {
              type: "nodes",
              title: ta("کاربر"),
              path: `${API}/auto/user`,
              getOptionLabel: (n) => getUserLabel(n as IUser),
              getOptionValue: (n) => (n as IUser)._id,
              getDefaultValue: (inp) => inp.user?._id,
              readOnly: true,
              required: true,
            },
            ...userAlertToggleFormRenderer,
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
