"use client";

import { useParams } from "next/navigation";
import { API } from "@/Components/config";
import InfoIcon from "@/Components/Icons/InfoIcon";
import {
  genderSpecificOptionsDict,
  IDisease,
  IDrug,
  ISymptom,
} from "./AdminManageDiseasesPage";
import { ISpeciality } from "../Speciality/AdminManageSpecialitiesPage";
import usePopup from "@/Components/Hooks/usePopup";
import DeleteDiseasePopup from "./DeleteDiseasePopup";
import useProgress from "@/Components/Hooks/useProgress";
import { adminPath } from "@/Components/helpers/adminPath";
import { IDiseaseCategory } from "../DiseaseCategory/AdminManageDiseaseCategoriesPage";
import { IDiseaseTag } from "../DiseaseTag/AdminManageDiseaseTagsPage";
import PageMetaEditor from "../PageMeta/PageMetaEditor";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminContentTranslationPage from "@/Components/Admin/ContentTranslation/AdminContentTranslationPage";
import AdminRecordEditor from "../UI/AdminRecordEditor";
import { medicalAiTools, medicalPublishFields } from "../Disease/medicalPublishing";

type DiseaseNode = IDisease<{
  Drugs: Record<never, never>;
  SameAs: Record<never, never>;
  Speciality: Record<never, never>;
  Symptom: Record<never, never>;
}>;

// one form for a disease, new or existing (Components/Admin/UI/
// AdminRecordEditor): its details, medical information and links are
// sections of that form, saved together
const AdminManageDiseasePage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { setPopup } = usePopup();
  const push = useProgress();
  const details = ta("جزئیات");
  const medical = ta("اطلاعات پزشکی");
  const connections = ta("اتصالات");

  return (
    <AdminRecordEditor<DiseaseNode>
      // AI draft of the empty fields / AI check, reviewed by a doctor
      tools={medicalAiTools<DiseaseNode>("disease")}
      segment="disease"
      path="/disease"
      nodeId={nodeId}
      newTitle={ta("بیماری جدید")}
      titleOf={(node) => node.name || ""}
      actions={(node) => [
        {
          title: ta("حذف"),
          danger: true,
          action: () =>
            setPopup(
              "DeleetDisease",
              <DeleteDiseasePopup mutate={() => push(adminPath(`/disease`))} node={node} />,
            ),
        },
      ]}
      // a new page is on the site once saved, unless switched off here
      newDefaults={{ published: true } as Partial<DiseaseNode>}
      renderer={{
                      name: { section: details, title: ta("نام"), type: "text", required: true },
                      description: { section: details, title: ta("توضیحات"), type: "area" },
                      summary: { section: details, title: ta("خلاصه"), type: "text" },
                      genderSpecific: { section: details,
                        title: ta("مخصوص جنسیت"),
                        type: "select",
                        options: genderSpecificOptionsDict,
                      },
                      image: { section: details, type: "image", title: ta("تصویر") },
                      slug: { section: details, type: "text", title: ta("اسلاگ") },
                      order: { section: details, type: "number", title: ta("رتبه") },
                      tag: { section: details,
                        type: "nodes",
                        title: ta("تگ"),
                        multi: false,
                        getOptionLabel: (node) =>
                          (node as IDiseaseTag).name || ta("بدون نام"),
                        getOptionValue: (node) => (node as IDiseaseTag)._id,
                        getDefaultValue: (inp) => inp.tag,
                        path: `${API}/auto/diseasetag`,
                        creatable: { path: `${API}/auto/diseasetag` },
                      },
                      category: { section: details,
                        type: "nodes",
                        title: ta("دسته بندی"),
                        path: `${API}/auto/diseaseCategory`,
                        creatable: { path: `${API}/auto/diseaseCategory` },
                        getOptionLabel: (node) =>
                          (node as IDiseaseCategory).name || ta("بدون نام"),
                        getOptionValue: (node) =>
                          (node as IDiseaseCategory)._id,
                        multi: false,
                        getDefaultValue: (inp) => inp.category,
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
                      symptoms: { section: connections,
                        type: "nodes",
                        path: `${API}/auto/symptom`,
                        title: ta("علائم"),
                        multi: true,
                        getDefaultValue: (val) =>
                          val.symptoms?.map((el) => el._id),
                        getOptionLabel: (node) =>
                          (node as ISymptom).name || ta("بدون نام"),
                        getOptionValue: (node) => (node as ISymptom)._id,
                        clearable: true,
                      },
                      specialities: { section: connections,
                        type: "nodes",
                        title: ta("تخصص ها"),
                        path: `${API}/auto/speciality`,
                        creatable: { path: `${API}/auto/speciality`, extra: { active: true } },
                        multi: true,
                        getOptionLabel: (node) =>
                          (node as ISpeciality).name || ta("بدون نام"),
                        getOptionValue: (node) => (node as ISpeciality)._id,
                        getDefaultValue: (val) =>
                          val.specialities?.map((el) => el._id),
                      },
                      drugs: { section: connections,
                        title: ta("دارو ها"),
                        type: "nodes",
                        getOptionLabel: (node) =>
                          (node as IDrug).name || ta("بدون نام"),
                        getOptionValue: (node) => (node as IDrug)._id,
                        path: `${API}/auto/drug`,
                        multi: true,
                        getDefaultValue: (val) =>
                          val.drugs?.map((el) => el._id),
                      },
                      sameAs: { section: connections,
                        type: "nodes",
                        title: ta("مشابهات"),
                        path: `${API}/auto/disease`,
                        multi: true,
                        getOptionLabel: (node) =>
                          (node as IDisease).name || ta("بدون نام"),
                        getOptionValue: (node) => (node as IDisease)._id,
                        getDefaultValue: (val) =>
                          val.sameAs?.map((el) => el._id),
                      },
                      ...medicalPublishFields<DiseaseNode>(ta("انتشار و بازبینی")),
      }}
      extraTabs={(node) => [
        {
          title: ta("سئو"),
          icon: <InfoIcon />,
          id: "Meta",
          content: <PageMetaEditor resourceType="/disease/[slug]" slug={node.slug} />,
        },
        {
          id: "translations",
          title: ta("ترجمه‌ها"),
          content: <AdminContentTranslationPage segment="disease" />,
        },
      ]}
    />
  );
};

export default AdminManageDiseasePage;
