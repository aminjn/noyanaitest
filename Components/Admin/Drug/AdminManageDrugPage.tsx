"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { IDrug } from "../Disease/AdminManageDiseasesPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import TabSystem from "../UI/TabSystem";
import InfoIcon from "@/Components/Icons/InfoIcon";
import CreateForm from "../UI/CreateForm";
import List from "../UI/List";
import Button from "@/Components/UI/Button";
import usePopup from "@/Components/Hooks/usePopup";
import useProgress from "@/Components/Hooks/useProgress";
import DeleteDrugPopup from "./DeleetDrugPopup";
import { adminPath } from "@/Components/helpers/adminPath";

const AdminManageDrugPage = () => {
  const { nodeId } = useParams();
  const { data, error, mutate } = useSWR<IDrug>(
    nodeId ? `${API}/auto/drug/${nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();
  const push = useProgress();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={data.name || data._id}>
          <TabSystem
            name="AdminManageDrug"
            items={[
              {
                title: "جزئیات",
                id: "Info",
                icon: <InfoIcon />,
                content: (
                  <CreateForm
                    hookProps={{
                      method: "POST",
                      path: `${API}/auto/drug/${data._id}`,
                      successCb: () => mutate(),
                    }}
                    defaultValue={data}
                    renderer={{
                      name: { type: "text", title: "نام" },
                      summary: { type: "text", title: "خلاصه" },
                      description: { type: "area", title: "توضیحات" },
                      order: { type: "number", title: "رتبه" },
                      slug: { type: "text", title: "اسلاگ" },
                      image: { type: "image", title: "تصویر" },
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
                      method: "POST",
                      path: `${API}/auto/drug/${data._id}`,
                      successCb: () => mutate(),
                    }}
                    renderer={{
                      sideEffects: { type: "area", title: "Side Effects" },
                      activeIngridient: {
                        type: "area",
                        title: "Active Ingridients",
                      },
                      adminstrationRoute: {
                        type: "area",
                        title: "Adminstration Route",
                      },
                      alcoholWarning: {
                        type: "area",
                        title: "Alcohol Warning",
                      },
                      alternateName: { type: "area", title: "Alternate Name" },
                      breastfeedingWarning: {
                        type: "area",
                        title: "Breast Feeding Warning",
                      },
                      clinicalPharmacology: {
                        type: "area",
                        title: "Clinical Pharmacology",
                      },
                      dosageForm: { type: "area", title: "Dosage Form" },
                      drugUnit: { type: "area", title: "Drug Unit" },
                      foodWarning: { type: "area", title: "Food Warning" },
                      identifier: { type: "area", title: "Identifier" },
                      overdosage: { type: "area", title: "Overdosage" },
                      pregnancyWarning: {
                        type: "area",
                        title: "Pregnany Warning",
                      },
                      prescribingInfo: {
                        type: "area",
                        title: "Prescribing Info",
                      },
                      prescriptionStatus: {
                        type: "area",
                        title: "Prescription Status",
                      },
                      warning: { type: "area", title: "Warning" },
                    }}
                  />
                ),
              },
              {
                title: "عملیات",
                icon: <InfoIcon />,
                content: (
                  <List>
                    <Button
                      onClick={() =>
                        setPopup(
                          "DeleteDrug",
                          <DeleteDrugPopup
                            mutate={() => push(adminPath(`/drug`))}
                            node={data}
                          />,
                        )
                      }
                      variant="Error"
                    >
                      حذف
                    </Button>
                  </List>
                ),
                id: "Actions",
              },
            ]}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageDrugPage;
