"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import {
  genderSpecificOptionsDict,
  IPart,
  ISymptom,
} from "../Disease/AdminManageDiseasesPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import usePopup from "@/Components/Hooks/usePopup";
import TabSystem from "../UI/TabSystem";
import InfoIcon from "@/Components/Icons/InfoIcon";
import CreateForm from "../UI/CreateForm";
import DeleteSymptomPopup from "./DeleteSymptomPopup";
import useProgress from "@/Components/Hooks/useProgress";
import { adminPath } from "@/Components/helpers/adminPath";
import { ISymptomCategory } from "../SymptomCategory/AdminManageSymptomCategoriesPage";
import PageMetaEditor from "../PageMeta/PageMetaEditor";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminContentTranslationPage from "@/Components/Admin/ContentTranslation/AdminContentTranslationPage";

const AdminManageSymptomPage = () => {
  const { nodeId } = useParams();
  const { data, error, mutate } = useSWR<
    ISymptom<{ Part: Record<never, never>; SameAs: Record<never, never> }>
  >(nodeId ? `${API}/auto/symptom/${nodeId}` : null, (url: string) =>
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
                  "DeleteSymptom",
                  <DeleteSymptomPopup
                    node={data}
                    mutate={() => push(adminPath(`/symptom`))}
                  />,
                ),
            },
          ]}
        >
          <TabSystem
            name="AdminManageSymptom"
            items={[
              {
                title: ta("جزئیات"),
                icon: <InfoIcon />,
                id: "Info",
                content: (
                  <CreateForm
                    defaultValue={data}
                    hookProps={{
                      path: `${API}/auto/symptom/${data._id}`,
                      method: "POST",
                      successCb: () => mutate(),
                    }}
                    renderer={{
                      name: { type: "text", title: ta("نام") },
                      summary: { title: ta("خلاصه"), type: "text" },
                      description: { title: ta("توضیحات"), type: "area" },
                      image: { title: ta("تصویر"), type: "image" },
                      order: { title: ta("رتبه"), type: "number" },
                      slug: { title: ta("اسلاگ"), type: "text" },
                      genderSpecific: {
                        title: ta("مخصوص جنسیت"),
                        type: "select",
                        options: genderSpecificOptionsDict,
                      },
                      category: {
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
                      aiSummary: { type: "rtf", title: ta("خلاصه AI") },
                      content: { type: "rtf", title: ta("محتوا") },
                    }}
                  />
                ),
              },
              {
                title: ta("اطلاعات پزشکی"),
                icon: <InfoIcon />,
                id: "More",
                content: (
                  <CreateForm
                    defaultValue={data}
                    hookProps={{
                      path: `${API}/auto/symptom/${data._id}`,
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
                title: ta("ارتباطات"),
                id: "Connections",
                icon: <InfoIcon />,
                content: (
                  <CreateForm
                    defaultValue={data}
                    renderer={{
                      part: {
                        type: "nodes",
                        path: `${API}/auto/part`,
                        title: ta("اعضا"),
                        getOptionLabel: (node) =>
                          (node as IPart).name || ta("بدون نام"),
                        getOptionValue: (node) => (node as IPart)._id,
                        getDefaultValue: (val) => val.part?.map((el) => el._id),
                        multi: true,
                        clearable: true,
                      },
                      sameAs: {
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
                    }}
                    hookProps={{
                      path: `${API}/auto/symptom/${data._id}`,
                      method: "POST",
                      successCb: () => mutate(),
                    }}
                  />
                ),
              },
              {
                title: ta("سئو"),
                icon: <InfoIcon />,
                id: "Meta",
                content: (
                  <PageMetaEditor resourceType="/symptom/[slug]" slug={data.slug} />
                ),
              },
              {
                id: "translations",
                title: ta("ترجمه‌ها"),
                content: <AdminContentTranslationPage segment="symptom" />,
              },
            ]}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageSymptomPage;
