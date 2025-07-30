"use client";

import useSWR from "swr";
import classes from "./AdminManageOldDrugsPage.module.css";
import { IOldDrug } from "../Doctor/AdminManageOldDoctorsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../../UI/HandleLoading";
import Table from "../../UI/Table";

const AdminManageOldDrugsPage = () => {
  const { data, error } = useSWR<IOldDrug[]>(`${API}/old/drug`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data)
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <Table
          data={data}
          renderer={{
            _id: { name: "آی دی", value: (node) => node._id, filter: "Text" },
            name: { name: "نام", value: (node) => node.name, filter: "Text" },
            description: {
              name: "توضیحات",
              value: (node) => node.description,
              filter: "Text",
            },
            sideEffects: {
              name: "عوارض جانبی",
              value: (node) => node.sideEffects,
              filter: "Text",
            },
            activeIngridient: {
              name: "مواد تشکیل دهنده",
              value: (node) => node.activeIngridient,
              filter: "Text",
            },
            adminstrationRoute: {
              name: "طریقه مصرف",
              value: (node) => node.adminstrationRoute,
              filter: "Text",
            },
            alcoholWarning: {
              name: "تداخل الکلی",
              value: (node) => node.alcoholWarning,
              filter: "Text",
            },
            alternateName: {
              name: "نام جایگزین",
              value: (node) => node.alternateName,
              filter: "Text",
            },
            breastfeedingWarning: {
              name: "عوارض شیردهی",
              value: (node) => node.breastfeedingWarning,
              filter: "Text",
            },
            clinicalPharmacology: {
              name: "Clinical Pharmacology",
              value: (node) => node.clinicalPharmacology,
              filter: "Text",
            },
            dosageForm: {
              name: "Dosage Form",
              value: (node) => node.dosageForm,
              filter: "Text",
            },
            drugUnit: {
              name: "واحد دارو",
              value: (node) => node.drugUnit,
              filter: "Text",
            },
            foodWarning: {
              name: "تداخل غذایی",
              value: (node) => node.foodWarning,
              filter: "Text",
            },
            identifier: {
              name: "Identifier",
              value: (node) => node.identifier,
              filter: "Text",
            },
            overdosage: {
              name: "اوردوز",
              value: (node) => node.overdosage,
              filter: "Text",
            },
            pregnancyWarning: {
              name: "خطرات بارداری",
              value: (node) => node.pregnancyWarning,
              filter: "Text",
            },
            prescribingInfo: {
              name: "Prescribing Info",
              value: (node) => node.prescribingInfo,
              filter: "Text",
            },
            prescriptionStatus: {
              name: "Prescribing Status",
              value: (node) => node.prescriptionStatus,
              filter: "Text",
            },
            warning: {
              name: "خطرات",
              value: (node) => node.warning,
              filter: "Text",
            },
            order: {
              name: "رتبه",
              value: (node) => node.order,
              filter: "Number",
            },
          }}
          name="AdminManageOldDrugs"
        />
      )}
    </HandleLoading>
  );
};

export default AdminManageOldDrugsPage;
