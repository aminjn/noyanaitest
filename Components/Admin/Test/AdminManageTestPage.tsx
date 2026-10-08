"use client";

import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import NodeManager from "../UI/NodeManger";
import TabSystem from "../UI/TabSystem";
import AdminContentTranslationPage from "@/Components/Admin/ContentTranslation/AdminContentTranslationPage";
import { ITest, testFormRenderer } from "./AdminManageTestsPage";
import { ta } from "@/Components/Admin/i18n/adminText";
import PageMetaEditor from "../PageMeta/PageMetaEditor";

// A test's record page: its details, the SEO of its public page
// (/test/<slug>, 2026-10) and the translations of its texts.
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
              id: "Meta",
              title: ta("سئو"),
              content: <PageMetaEditor resourceType="/test/[slug]" slug={node.slug} />,
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
