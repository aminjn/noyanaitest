"use client";

import useSWR from "swr";
import classes from "./AdminManageOldSymptomsPage.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../../UI/HandleLoading";
import Table from "../../UI/Table";
import { IOldSymptom } from "../Doctor/AdminManageOldDoctorsPage";
import { ta } from "@/Components/Admin/i18n/adminText";

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
            name: { name: ta("نام"), value: (node) => node.name, filter: "Text" },
            genderSpecific: {
              name: ta("مختص جنسیت"),
              value: (node) => node.genderSpecific,
              filter: "Set",
            },
            order: {
              name: ta("رتبه"),
              filter: "Number",
              value: (node) => node.order,
            },
            _id: { name: ta("شناسه"), value: (node) => node._id, filter: "Text" },
          }}
        />
      )}
    </HandleLoading>
  );
};

export default AdminManageOldSymptomsPage;
