"use client";
import AdminContentTranslationPage from "@/Components/Admin/ContentTranslation/AdminContentTranslationPage";
import { ISpeciality } from "./AdminManageSpecialitiesPage";
import InfoIcon from "@/Components/Icons/InfoIcon";
import usePopup from "@/Components/Hooks/usePopup";
import useProgress from "@/Components/Hooks/useProgress";
import DeleteSpecialityPopup from "./DeletSpecialityPopup";
import { adminPath } from "@/Components/helpers/adminPath";
import { useParams } from "next/navigation";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import PageMetaEditor from "../PageMeta/PageMetaEditor";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminRecordEditor from "../UI/AdminRecordEditor";

// one form for a speciality, new (`/speciality/new`) or existing
// (Components/Admin/UI/AdminRecordEditor). The slug is generated from the
// name by the backend job when left empty.
const AdminManageSpecialityPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { setPopup } = usePopup();
  const push = useProgress();
  const hasAccess = useAccessLevel();

  return (
    <AdminRecordEditor<ISpeciality>
      segment="speciality"
      path="/speciality"
      nodeId={nodeId}
      newTitle={ta("تخصص جدید")}
      titleOf={(node) => node.name || ""}
      readOnly={nodeId !== "new" && !hasAccess("Sepciality", "update")}
      actions={(node) =>
        hasAccess("Sepciality", "delete")
          ? [
              {
                title: ta("حذف"),
                danger: true,
                action: () =>
                  setPopup(
                    "DeleteSpeciality",
                    <DeleteSpecialityPopup
                      node={node}
                      mutate={() => push(adminPath("/speciality"))}
                    />,
                  ),
              },
            ]
          : []
      }
      renderer={{
        name: { type: "text", title: ta("نام"), required: true },
        slug: { type: "text", title: ta("اسلاگ") },
        summary: { type: "text", title: ta("خلاصه") },
        order: { type: "number", title: ta("رتبه") },
        active: { type: "bool", title: ta("فعال") },
        isHome: { type: "bool", title: ta("نمایش در خانه") },
        image: { type: "image", title: ta("تصویر") },
        description: { type: "rtf", title: ta("توضیحات") },
      }}
      extraTabs={(node) => [
        {
          title: ta("سئو"),
          id: "Meta",
          icon: <InfoIcon />,
          content: (
            <PageMetaEditor
              resourceType="/speciality/[slug]"
              slug={node.slug}
            />
          ),
        },
        {
          id: "translations",
          title: ta("ترجمه‌ها"),
          content: <AdminContentTranslationPage segment="speciality" />,
        },
      ]}
    />
  );
};

export default AdminManageSpecialityPage;
