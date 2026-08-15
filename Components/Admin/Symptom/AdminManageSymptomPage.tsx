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
import List from "../UI/List";
import Button from "@/Components/UI/Button";
import DeleteSymptomPopup from "./DeleteSymptomPopup";
import useProgress from "@/Components/Hooks/useProgress";
import { adminPath } from "@/Components/helpers/adminPath";
import { ISymptomCategory } from "../SymptomCategory/AdminManageSymptomCategoriesPage";
import PageMetaEditor from "../PageMeta/PageMetaEditor";

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
        <WithTitle title={data.name || data._id}>
          <TabSystem
            name="AdminManageSymptom"
            items={[
              {
                title: "جزئیات",
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
                      name: { type: "text", title: "نام" },
                      summary: { title: "خلاصه", type: "text" },
                      description: { title: "توضیحات", type: "area" },
                      image: { title: "تصویر", type: "image" },
                      order: { title: "رتبه", type: "number" },
                      slug: { title: "اسلاگ", type: "text" },
                      genderSpecific: {
                        title: "مخصوص جنسیت",
                        type: "select",
                        options: genderSpecificOptionsDict,
                      },
                      category: {
                        type: "nodes",
                        title: "دسته بندی",
                        getOptionLabel: (node) =>
                          (node as ISymptomCategory).name ||
                          (node as ISymptomCategory)._id,
                        getOptionValue: (node) =>
                          (node as ISymptomCategory)._id,
                        getDefaultValue: (inp) => inp.category,
                        multi: false,
                        path: `${API}/auto/symptomCategory`,
                      },
                      aiSummary: { type: "rtf", title: "خلاصه AI" },
                      content: { type: "rtf", title: "محتوا" },
                    }}
                  />
                ),
              },
              {
                title: "توضیحات",
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
                      expectedPrognosis: {
                        type: "area",
                        title: "Expected Prognosis",
                      },
                      naturalProgression: {
                        type: "area",
                        title: "Natural Progression",
                      },
                      pathophysiology: {
                        title: "Pathophysiology",
                        type: "area",
                      },
                      possibleComplication: {
                        title: "Possible Complications",
                        type: "area",
                      },
                    }}
                  />
                ),
              },
              {
                title: "ارتباطات",
                id: "Connections",
                icon: <InfoIcon />,
                content: (
                  <CreateForm
                    defaultValue={data}
                    renderer={{
                      part: {
                        type: "nodes",
                        path: `${API}/auto/part`,
                        title: "اهضا",
                        getOptionLabel: (node) =>
                          (node as IPart).name || (node as IPart)._id,
                        getOptionValue: (node) => (node as IPart)._id,
                        getDefaultValue: (val) => val.part.map((el) => el._id),
                        multi: true,
                        clearable: true,
                      },
                      sameAs: {
                        type: "nodes",
                        title: "مشابهات",
                        multi: true,
                        path: `${API}/auto/symptom`,
                        getOptionLabel: (node) =>
                          (node as ISymptom).name || (node as ISymptom)._id,
                        getOptionValue: (node) => (node as ISymptom)._id,
                        clearable: true,
                        getDefaultValue: (val) =>
                          val.sameAs.map((el) => el._id),
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
                title: "متادیتا",
                icon: <InfoIcon />,
                id: "Meta",
                content: (
                  <PageMetaEditor resourceType="/symptom/[slug]" slug={data.slug} />
                ),
              },
              {
                title: "عملیات",
                icon: <InfoIcon />,
                id: "Actions",
                content: (
                  <List>
                    <Button
                      variant="Error"
                      onClick={() =>
                        setPopup(
                          "DeleteSymptom",
                          <DeleteSymptomPopup
                            node={data}
                            mutate={() => push(adminPath(`/symptom`))}
                          />,
                        )
                      }
                    >
                      حذف
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

export default AdminManageSymptomPage;
