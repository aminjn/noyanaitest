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
import List from "../UI/List";
import Button from "@/Components/UI/Button";
import usePopup from "@/Components/Hooks/usePopup";
import DeleteDiseasePopup from "./DeleteDiseasePopup";
import useProgress from "@/Components/Hooks/useProgress";
import { adminPath } from "@/Components/helpers/adminPath";
import { IDiseaseCategory } from "../DiseaseCategory/AdminManageDiseaseCategoriesPage";
import { IDiseaseTag } from "../DiseaseTag/AdminManageDiseaseTagsPage";
import PageMetaEditor from "../PageMeta/PageMetaEditor";
import { ta } from "@/Components/Admin/i18n/adminText";

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
        <WithTitle title={data.name || data._id}>
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
                          (node as IDiseaseTag).name ||
                          (node as IDiseaseTag)._id,
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
                          (node as IDiseaseCategory).name ||
                          (node as IDiseaseCategory)._id,
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
                title: ta("توضیحات"),
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
                      expectedPrognosis: {
                        type: "area",
                        title: "Expected Prognosis",
                      },
                      naturalProgression: {
                        type: "area",
                        title: "Natural Progression",
                      },
                      pathophysiology: {
                        type: "area",
                        title: "Pathophysiology",
                      },
                      possibleComplication: {
                        type: "area",
                        title: "Possible Complications",
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
                          (node as ISymptom).name || (node as ISymptom)._id,
                        getOptionValue: (node) => (node as ISymptom)._id,
                        clearable: true,
                      },
                      specialities: {
                        type: "nodes",
                        title: ta("تخصص ها"),
                        path: `${API}/auto/speciality`,
                        multi: true,
                        getOptionLabel: (node) =>
                          (node as ISpeciality).name ||
                          (node as ISpeciality)._id,
                        getOptionValue: (node) => (node as ISpeciality)._id,
                        getDefaultValue: (val) =>
                          val.specialities.map((el) => el._id),
                      },
                      drugs: {
                        title: ta("دارو ها"),
                        type: "nodes",
                        getOptionLabel: (node) =>
                          (node as IDrug).name || (node as IDrug)._id,
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
                          (node as IDisease).name || (node as IDisease)._id,
                        getOptionValue: (node) => (node as IDisease)._id,
                        getDefaultValue: (val) =>
                          val.sameAs.map((el) => el._id),
                      },
                    }}
                  />
                ),
              },
              {
                title: ta("متادیتا"),
                icon: <InfoIcon />,
                id: "Meta",
                content: (
                  <PageMetaEditor resourceType="/disease/[slug]" slug={data.slug} />
                ),
              },
              {
                title: ta("عملیات"),
                id: "Actions",
                icon: <InfoIcon />,
                content: (
                  <List>
                    <Button
                      variant="Error"
                      onClick={() =>
                        setPopup(
                          "DeleetDisease",
                          <DeleteDiseasePopup
                            mutate={() => push(adminPath(`/disease`))}
                            node={data}
                          />,
                        )
                      }
                    >
                      {ta("حذف")}
                    </Button>
                  </List>
                ),
              },
            ]}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageDiseasePage;
