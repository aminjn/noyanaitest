"use client";

import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import NodeManager from "../UI/NodeManger";
import {
  IParaClinicTag,
  paraClinicTagFormRenderer,
} from "./AdminManageParaClinicTagsPage";

const AdminManageParaClinicTagPage = () => {
  return (
    <NodeManager<IParaClinicTag>
      modelName="paraClinicTag"
      getTitle={(node) => node.name || node._id}
      content={({ mutate, node }) => (
        <CreateForm
          renderer={paraClinicTagFormRenderer}
          defaultValue={node}
          hookProps={{
            path: `${API}/auto/paraClinicTag/${node._id}`,
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

export default AdminManageParaClinicTagPage;
