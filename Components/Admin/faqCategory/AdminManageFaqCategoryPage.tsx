"use client";

import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import NodeManager from "../UI/NodeManger";
import {
  FaqCategoryFormRenderer,
  IFaqCategory,
} from "./AdminManageFaqCategoriesPage";

const AdminManageFaqCategoryPage = () => {
  return (
    <NodeManager<IFaqCategory>
      getTitle={(node) => node.name || node._id}
      modelName="faqCategory"
      content={({ mutate, node }) => (
        <CreateForm
          defaultValue={node}
          renderer={FaqCategoryFormRenderer}
          hookProps={{
            path: `${API}/auto/faqCategory/${node._id}`,
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

export default AdminManageFaqCategoryPage;
