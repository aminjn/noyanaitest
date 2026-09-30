"use client";

import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { useParams } from "next/navigation";
import useSWR from "swr";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import TabSystem from "../UI/TabSystem";
import InfoIcon from "@/Components/Icons/InfoIcon";
import CreateForm from "../UI/CreateForm";
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

const AdminManageDiseasePage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<
    IDisease<{
      Drugs: Record<never, never>;
      SameAs: Record<never, never>;
      Speciality: Record<never, never>;
      Symptom: Record<never, never>;
    }>
  >(nodeId ? `${API}/auto/disease/${nodeId}` : null, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();
  const push = useProgress();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={data.name || ta("بدون نام")}
          actions={[
            {
              title: ta("حذف"),
              danger: true,
              action: () =>
                setPopup(
                  "DeleetDisease",
                  <DeleteDiseasePopup
                    mutate={() => push(adminPath(`/disease`))}
                    node={data}
                  />,
                ),
            },
          ]}
        >
          <TabSystem
            name="AdminManageDisease"
            items={[
              {
                title: ta("جزئیات"),
                content: (
                  <CreateForm
                    defaultValue={data}
                    hookProps={{
                      path: `${API}/auto/disease/${data._id}`,
                      method: "POST",
                      successCb: () => mutate(),
                    }}
                    renderer={{
                      name: { title: ta("نام"), type: "text" },
                      description: { title: ta("توضیحات"), type: "area" },
                      summary: { title: ta("خلاصه"), type: "text" },
                      genderSpecific: {
                        title: ta("مخصوص جنسیت"),
                        type: "select",
                        options: genderSpecificOptionsDict,
                      },
                      image: { type: "image", title: ta("تصویر") },
                      slug: { type: "text", title: ta("اسلاگ") },
                      order: { type: "number", title: ta("رتبه") },
                      tag: {
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
                      category: {
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
                      aiSummary: { type: "rtf", title: ta("خلاصه AI") },
                      content:{type:"rtf" , title:ta("محتوا") }
                    }}
                  />
                ),
                icon: <InfoIcon />,
                id: "Details",
              },
              {
                title: ta("اطلاعات پزشکی"),
                icon: <InfoIcon />,
                id: "More",
                content: (
                  <CreateForm
                    defaultValue={data}
                    hookProps={{
                      path: `${API}/auto/disease/${data._id}`,
                      method: "POST",
                      successCb: () => mutate(),
                    }}
                    renderer={{
                      pathophysiology: {
                        type: "area",
                        title: ta("پاتوفیزیولوژی"),
                      },
                      naturalProgression: {
                        type: "area",
                        title: ta("سیر طبیعی"),
                      },
                      possibleComplication: {
                        type: "area",
                        title: ta("عوارض احتمالی"),
                      },
                      expectedPrognosis: {
                        type: "area",
                        title: ta("پیش‌آگهی"),
                      },
                    }}
                  />
                ),
              },
              {
                title: ta("اتصالات"),
                icon: <InfoIcon />,
                id: "Connections",
                content: (
                  <CreateForm
                    defaultValue={data}
                    hookProps={{
                      path: `${API}/auto/disease/${data._id}`,
                      method: "POST",
                      successCb: () => mutate(),
                    }}
                    renderer={{
                      symptoms: {
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
                      specialities: {
                        type: "nodes",
                        title: ta("تخصص ها"),
                        path: `${API}/auto/speciality`,
                        multi: true,
                        getOptionLabel: (node) =>
                          (node as ISpeciality).name || ta("بدون نام"),
                        getOptionValue: (node) => (node as ISpeciality)._id,
                        getDefaultValue: (val) =>
                          val.specialities?.map((el) => el._id),
                      },
                      drugs: {
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
                      sameAs: {
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
                    }}
                  />
                ),
              },
              {
                title: ta("سئو"),
                icon: <InfoIcon />,
                id: "Meta",
                content: (
                  <PageMetaEditor resourceType="/disease/[slug]" slug={data.slug} />
                ),
              },
              {
                id: "translations",
                title: ta("ترجمه‌ها"),
                content: <AdminContentTranslationPage segment="disease" />,
              },
            ]}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageDiseasePage;
