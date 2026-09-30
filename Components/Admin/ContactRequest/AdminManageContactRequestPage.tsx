"use client";

import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import NodeManager from "../UI/NodeManger";
import TabSystem from "../UI/TabSystem";
import {
  contactRequestStatusDict,
  contactRequestSubjectDict,
  IContactRequest,
} from "./AdminManageContactRequestsPage";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageContactRequestPage = () => {
  return (
    <NodeManager<IContactRequest>
      getTitle={(node) => node.name}
      modelName="contactRequest"
      content={({ mutate, node }) => (
        <TabSystem
          items={[
            {
              title: ta("اطلاعات"),
              id: "Info",
              content: (
                <CreateForm
                  hookProps={{
                    path: `${API}/auto/contactRequest/${node._id}`,
                    method: "POST",
                    successCb: () => {
                      mutate();
                    },
                  }}
                  defaultValue={node}
                  renderer={{
                    name: { type: "text", title: ta("نام"), readOnly: true },
                    phone: { type: "text", title: ta("شماره"), readOnly: true },
                    email: { type: "text", title: ta("ایمیل"), readOnly: true },
                    subject: {
                      type: "select",
                      title: ta("موضوع"),
                      options: contactRequestSubjectDict,
                      readOnly: true,
                    },
                    content: { type: "area", title: ta("پیام"), readOnly: true },
                    submittedAt: {
                      type: "date",
                      title: ta("زمان ثبت"),
                      readOnly: true,
                    },
                    status: {
                      type: "select",
                      title: ta("وضعیت"),
                      options: contactRequestStatusDict,
                    },
                  }}
                />
              ),
            },
          ]}
        />
      )}
    />
  );
};

export default AdminManageContactRequestPage;
