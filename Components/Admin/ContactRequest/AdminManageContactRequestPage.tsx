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

const AdminManageContactRequestPage = () => {
  return (
    <NodeManager<IContactRequest>
      getTitle={(node) => node.name}
      modelName="contactRequest"
      content={({ mutate, node }) => (
        <TabSystem
          items={[
            {
              title: "اطلاعات",
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
                    name: { type: "text", title: "نام", readOnly: true },
                    phone: { type: "text", title: "شماره", readOnly: true },
                    email: { type: "text", title: "ایمیل", readOnly: true },
                    subject: {
                      type: "select",
                      title: "موضوع",
                      options: contactRequestSubjectDict,
                      readOnly: true,
                    },
                    content: { type: "area", title: "پیام", readOnly: true },
                    submittedAt: {
                      type: "date",
                      title: "زمان ثبت",
                      readOnly: true,
                    },
                    status: {
                      type: "select",
                      title: "وضعیت",
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
