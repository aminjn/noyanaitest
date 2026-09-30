"use client";

import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import NodeManager from "../UI/NodeManger";
import TabSystem from "../UI/TabSystem";
import AdminContentTranslationPage from "@/Components/Admin/ContentTranslation/AdminContentTranslationPage";
import { ITest, testFormRenderer } from "./AdminManageTestsPage";
import { ta } from "@/Components/Admin/i18n/adminText";

// A test has no public page of its own (it is listed under its category),
// so its record page is the details plus the translations of its name and
// summary - no SEO tab.
const AdminManageTestPage = () => {
  return (
    <NodeManager<ITest>
      modelName="test"
      deleteBackTo="/test?tab=tests"
      getTitle={(node) => node.name || ta("بدون نام")}
      content={({ node, mutate }) => (
        <TabSystem
          name="AdminManageTest"
          items={[
            {
              id: "Info",
              title: ta("اطلاعات"),
              content: (
                <CreateForm
                  defaultValue={node}
                  renderer={testFormRenderer}
                  hookProps={{
                    path: `${API}/auto/test/${node._id}`,
                    method: "POST",
                    successCb: () => mutate(),
                  }}
                />
              ),
            },
            {
              id: "translations",
              title: ta("ترجمه‌ها"),
              content: <AdminContentTranslationPage segment="test" />,
            },
          ]}
        />
      )}
    />
  );
};

export default AdminManageTestPage;
