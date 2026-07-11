"use client";

import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import NodeManager from "../UI/NodeManger";
import {
  ISymptomCategory,
  symptomCategoryFormRenderer,
} from "./AdminManageSymptomCategoriesPage";

const AdminManageSymptomCategoryPage = () => {
  return (
    <NodeManager<ISymptomCategory>
      content={({ mutate, node }) => (
        <CreateForm
          defaultValue={node}
          renderer={symptomCategoryFormRenderer}
          hookProps={{
            path: `${API}/auto/symptomCategory/${node._id}`,
            method: "POST",
            successCb: () => mutate(),
          }}
        />
      )}
      getTitle={(node) => node.name || node._id}
      modelName="symptomCategory"
    />
  );
};

export default AdminManageSymptomCategoryPage;
