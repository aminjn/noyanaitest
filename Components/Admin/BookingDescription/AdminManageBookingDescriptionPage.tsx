"use client";

import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import NodeManager from "../UI/NodeManger";
import {
  bookingDescriptionFormRenderer,
  IBookingDescription,
} from "./AdminManageBookingDescriptionsPage";

const AdminManageBookingDescriptionPage = () => {
  return (
    <NodeManager<IBookingDescription>
      modelName="bookingDescription"
      getTitle={(node) => node.title || node._id}
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
