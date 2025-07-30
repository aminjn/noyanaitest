"use client";

import useSWR from "swr";
import classes from "./AdminManageOldSymptomsPage.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../../UI/HandleLoading";
import Table from "../../UI/Table";
import { IOldSymptom } from "../Doctor/AdminManageOldDoctorsPage";

const AdminManageOldSymptomsPage = () => {
  const { data, error } = useSWR<IOldSymptom[]>(
    `${API}/old/symptom`,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <Table
          data={data}
          name="AdminManageOldSymptoms"
          renderer={{
            _id: { name: "آی دی", value: (node) => node._id, filter: "Text" },
            name: { name: "نام", value: (node) => node.name, filter: "Text" },
            //part
            summary: {
              name: "خلاصه",
              value: (node) => node.summary,
              filter: "Text",
            },
            description: {
              name: "توضیحات",
              value: (node) => node.description,
              filter: "Text",
            },
            expectedPrognosis: {
              name: "Expected Prognosis",
              value: (node) => node.expectedPrognosis,
              filter: "Text",
            },
            naturalProgression: {
              name: "Natural Progression",
              value: (node) => node.naturalProgression,
              filter: "Text",
            },
            pathophysiology: {
              name: "Pathophysiology",
              value: (node) => node.pathophysiology,
              filter: "Text",
            },
            possibleComplication: {
              name: "Possible Complication",
              value: (node) => node.possibleComplication,
              filter: "Text",
            },
            order: {
              name: "رتبه",
              filter: "Number",
              value: (node) => node.order,
            },
          }}
        />
      )}
    </HandleLoading>
  );
};

export default AdminManageOldSymptomsPage;
