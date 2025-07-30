"use client";

import useSWR from "swr";
import classes from "./AdminManageOldDiseasesPage.module.css";
import { IOldDisease } from "../Doctor/AdminManageOldDoctorsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../../UI/HandleLoading";
import Table from "../../UI/Table";

const AdminManageOldDiseasesPage = () => {
  const { data, error } = useSWR<IOldDisease[]>(
    `${API}/old/disease`,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <Table
          data={data}
          name="AdminManageOldDiseases"
          renderer={{
            _id: { name: "آی دی", value: (node) => node._id, filter: "Text" },
            name: { name: "نام", value: (node) => node.name, filter: "Text" },
            description: {
              name: "توضیحات",
              value: (node) => node.description,
              filter: "Text",
            },
            summary: {
              name: "خلاصه",
              value: (node) => node.summary,
              filter: "Text",
            },
            //symptoms
            // specialities
            // drugs
            genderSpecific: {
              name: "Gender Specific",
              value: (node) => node.genderSpecific,
              filter: "Set",
            },
            expectedPrognosis: {
              name: "Expected Prognosis",
              value: (node) => node.expectedPrognosis,
              filter: "Text",
            },
            naturalProgression: {
              name: "Natural Progression",
              value: (node) => node.naturalProgression,
              filter: "Set",
            },
            pathophysiology: {
              name: "Pathophysiology",
              value: (node) => node.pathophysiology,
              filter: "Text",
            },
            possibleComlplication: {
              name: "Possible Complications",
              value: (node) => node.possibleComlplication,
              filter: "Text",
            },
            order: { name: "رتبه", value: (node) => node.order },
          }}
        />
      )}
    </HandleLoading>
  );
};

export default AdminManageOldDiseasesPage;
