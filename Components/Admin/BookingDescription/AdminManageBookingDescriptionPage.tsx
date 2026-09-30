"use client";

import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import { ta } from "@/Components/Admin/i18n/adminText";
import NodeManager from "../UI/NodeManger";
import {
  bookingDescriptionFormRenderer,
  IBookingDescription,
} from "./AdminManageBookingDescriptionsPage";

const AdminManageBookingDescriptionPage = () => {
  return (
    <NodeManager<IBookingDescription>
      deleteBackTo="/bookingDescription"
      modelName="bookingDescription"
      getTitle={(node) => node.title || ta("بدون نام")}
      content={({ mutate, node }) => (
        <CreateForm
          defaultValue={node}
          renderer={bookingDescriptionFormRenderer}
          hookProps={{
            path: `${API}/auto/bookingDescription/${node._id}`,
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

export default AdminManageBookingDescriptionPage;
