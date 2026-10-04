"use client";

import { useParams } from "next/navigation";
import {
  genderSpecificOptionsDict,
  IPart,
  ISymptom,
} from "../Disease/AdminManageDiseasesPage";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";
import InfoIcon from "@/Components/Icons/InfoIcon";
import DeleteSymptomPopup from "./DeleteSymptomPopup";
import useProgress from "@/Components/Hooks/useProgress";
import { adminPath } from "@/Components/helpers/adminPath";
import { ISymptomCategory } from "../SymptomCategory/AdminManageSymptomCategoriesPage";
import PageMetaEditor from "../PageMeta/PageMetaEditor";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminContentTranslationPage from "@/Components/Admin/ContentTranslation/AdminContentTranslationPage";

import AdminRecordEditor from "../UI/AdminRecordEditor";
import { medicalPublishFields } from "../Disease/medicalPublishing";

// one form for a symptom, new or existing (Components/Admin/UI/
// AdminRecordEditor): details, medical information and links, saved together
type SymptomNode = ISymptom<{ Part: Record<never, never>; SameAs: Record<never, never> }>;

const AdminManageSymptomPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { setPopup } = usePopup();
  const push = useProgress();
  const details = ta("جزئیات");
  const medical = ta("اطلاعات پزشکی");
  const connections = ta("ارتباطات");

  return (
    <AdminRecordEditor<SymptomNode>
      segment="symptom"
      path="/symptom"
      nodeId={nodeId}
      newTitle={ta("علامت جدید")}
      titleOf={(node) => node.name || ""}
      actions={(node) => [
        {
          title: ta("حذف"),
          danger: true,
          action: () =>
            setPopup(
              "DeleteSymptom",
              <DeleteSymptomPopup mutate={() => push(adminPath(`/symptom`))} node={node} />,
            ),
        },
      ]}
      // a new page is on the site once saved, unless switched off here
      newDefaults={{ published: true } as Partial<SymptomNode>}
      renderer={{
                      name: { section: details, type: "text", title: ta("نام"), required: true },
                      summary: { section: details, title: ta("خلاصه"), type: "text" },
                      description: { section: details, title: ta("توضیحات"), type: "area" },
                      image: { section: details, title: ta("تصویر"), type: "image" },
                      order: { section: details, title: ta("رتبه"), type: "number" },
                      slug: { section: details, title: ta("اسلاگ"), type: "text" },
                      genderSpecific: { section: details,
                        title: ta("مخصوص جنسیت"),
                        type: "select",
                        options: genderSpecificOptionsDict,
                      },
                      category: { section: details,
                        type: "nodes",
                        title: ta("دسته بندی"),
                        getOptionLabel: (node) =>
                          (node as ISymptomCategory).name || ta("بدون نام"),
                        getOptionValue: (node) =>
                          (node as ISymptomCategory)._id,
                        getDefaultValue: (inp) => inp.category,
                        multi: false,
                        path: `${API}/auto/symptomCategory`,
                        creatable: { path: `${API}/auto/symptomCategory` },
                      },
                      aiSummary: { section: details, type: "rtf", title: ta("خلاصه AI") },
                      content: { section: details, type: "rtf", title: ta("محتوا") },
                      pathophysiology: { section: medical,
                        type: "area",
                        title: ta("پاتوفیزیولوژی"),
                      },
                      naturalProgression: { section: medical,
                        type: "area",
                        title: ta("سیر طبیعی"),
                      },
                      possibleComplication: { section: medical,
                        type: "area",
                        title: ta("عوارض احتمالی"),
                      },
                      expectedPrognosis: { section: medical,
                        type: "area",
                        title: ta("پیش‌آگهی"),
                      },
                      part: { section: connections,
                        type: "nodes",
                        path: `${API}/auto/part`,
                        title: ta("اعضا"),
                        getOptionLabel: (node) =>
                          (node as IPart).name || ta("بدون نام"),
                        getOptionValue: (node) => (node as IPart)._id,
                        getDefaultValue: (val) => val.part?.map((el) => el._id),
                        multi: true,
                        clearable: true,
                        creatable: { path: `${API}/auto/part` },
                      },
                      sameAs: { section: connections,
                        type: "nodes",
                        title: ta("مشابهات"),
                        multi: true,
                        path: `${API}/auto/symptom`,
                        getOptionLabel: (node) =>
                          (node as ISymptom).name || ta("بدون نام"),
                        getOptionValue: (node) => (node as ISymptom)._id,
                        clearable: true,
                        getDefaultValue: (val) =>
                          val.sameAs?.map((el) => el._id),
                      },
                      ...medicalPublishFields<SymptomNode>(ta("انتشار و بازبینی")),
      }}
      extraTabs={(node) => [
        {
          title: ta("سئو"),
          icon: <InfoIcon />,
          id: "Meta",
          content: <PageMetaEditor resourceType="/symptom/[slug]" slug={node.slug} />,
        },
        {
          id: "translations",
          title: ta("ترجمه‌ها"),
          content: <AdminContentTranslationPage segment="symptom" />,
        },
      ]}
    />
  );
};

export default AdminManageSymptomPage;
