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
    fetcher({ url }).then((res) => res.data.data)
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
                title: "جزئیات",
                content: (
                  <CreateForm
                    defaultValue={data}
                    hookProps={{
                      path: `${API}/auto/disease/${data._id}`,
                      method: "POST",
                      successCb: () => mutate(),
                    }}
                    renderer={{
                      name: { title: "نام", type: "text" },
                      description: { title: "توضیحات", type: "area" },
                      summary: { title: "خلاصه", type: "text" },
                      genderSpecific: {
                        title: "مخصوص جنسیت",
                        type: "select",
                        options: genderSpecificOptionsDict,
                      },
                      image: { type: "image", title: "تصویر" },
                      slug: { type: "text", title: "اسلاگ" },
                      order: { type: "number", title: "رتبه" },
                    }}
                  />
                ),
                icon: <InfoIcon />,
                id: "Details",
              },
              {
                title: "توضیحات",
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
                title: "اتصالات",
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
                        title: "علائم",
                        multi: true,
                        getDefaultValue: (val) =>
                          val.symptoms.map((el) => el._id),
                        getOptionLabel: (node) =>
                          (node as ISymptom).name || (node as ISymptom)._id,
                        getOptionValue: (node) => (node as ISymptom)._id,
                        clearable: true,
                      },
                      specialities: {
                        type: "nodes",
                        title: "تخصص ها",
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
                        title: "دارو ها",
                        type: "nodes",
                        getOptionLabel: (node) =>
                          (node as IDrug).name || (node as IDrug)._id,
                        getOptionValue: (node) => (node as IDrug)._id,
                        path: `${API}/auto/drug`,
                        multi: true,
                        getDefaultValue: (val) => val.drugs.map((el) => el._id),
                      },
                      sameAs: {
                        type: "nodes",
                        title: "مشابهات",
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
                title: "عملیات",
                id: "Actions",
                icon: <InfoIcon />,
                content: (
                  <List>
                    <Button
                      variant="Danger"
                      onClick={() =>
                        setPopup(
                          "DeleetDisease",
                          <DeleteDiseasePopup
                            mutate={() => push(adminPath(`/disease`))}
                            node={data}
                          />
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

export default AdminManageDiseasePage;
