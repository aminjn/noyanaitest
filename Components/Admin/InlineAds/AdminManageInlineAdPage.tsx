"use client";
import AdminContentTranslationPage from "@/Components/Admin/ContentTranslation/AdminContentTranslationPage";

import { useParams } from "next/navigation";
import { IInlineAdvertisement } from "./AdminManageInlineAdsPage";
import usePopup from "@/Components/Hooks/usePopup";
import DeleteInlineAdPopup from "./DeleteInlineAdPopup";
import useProgress from "@/Components/Hooks/useProgress";
import { adminPath } from "@/Components/helpers/adminPath";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminRecordEditor from "../UI/AdminRecordEditor";

// one form for an inline ad, new (`/inlinead/new`) or existing
// (Components/Admin/UI/AdminRecordEditor)
const AdminManageInlineAdPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { setPopup } = usePopup();
  const push = useProgress();
  const hasAccess = useAccessLevel();

  return (
    <AdminRecordEditor<IInlineAdvertisement>
      segment="inlinead"
      path="/inlinead"
      nodeId={nodeId}
      newTitle={ta("تبلیغ خطی جدید")}
      titleOf={(node) => node.name || node.title || ""}
      readOnly={nodeId !== "new" && !hasAccess("InlineAdvertisement", "update")}
      actions={(node) =>
        hasAccess("InlineAdvertisement", "delete")
          ? [
              {
                title: ta("حذف"),
                danger: true,
                action: () =>
                  setPopup(
                    "DeleteInlineAd",
                    <DeleteInlineAdPopup
                      node={node}
                      mutate={() => push(adminPath("/ads?tab=inline"))}
                    />,
                  ),
              },
            ]
          : []
      }
      renderer={{
        name: { title: ta("نام"), type: "text", required: true },
        title: { title: ta("عنوان"), type: "text" },
        subTitle: { title: ta("توضیحات"), type: "text" },
        target: { title: ta("مقصد"), type: "text" },
        expiration: { type: "date", title: ta("تاریخ انقضا") },
        active: { type: "bool", title: ta("فعال") },
        image: { title: ta("تصویر"), type: "image" },
      }}
      extraTabs={() => [
        {
          id: "translations",
          title: ta("ترجمه‌ها"),
          content: <AdminContentTranslationPage segment="inlinead" />,
        },
      ]}
    />
  );
};

export default AdminManageInlineAdPage;
