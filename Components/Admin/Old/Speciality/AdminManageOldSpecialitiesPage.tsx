"use client";

import useSWR from "swr";
import classes from "./AdminManageOldSpecialitiesPage.module.css";
import { IOldSpeciality } from "../Doctor/AdminManageOldDoctorsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../../UI/HandleLoading";
import Table from "../../UI/Table";

const AdminManageOldSpecialitiesPage = () => {
  const { data, error } = useSWR<IOldSpeciality[]>(
    `${API}/old/speciality`,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <Table
          name="AdminManageOldSpecialities"
          data={data}
          renderer={{
            _id: { name: "آی دی", value: (node) => node._id, filter: "Text" },
            name: { name: "نام", value: (node) => node.name, filter: "Text" },
            order: {
              name: "رتبه",
              value: (node) => node.order,
              filter: "Number",
            },
            summary: {
              name: "خلاصه",
              value: (node) => node.summary,
              filter: "Text",
            },
          }}
        />
      )}
    </HandleLoading>
  );
};

export default AdminManageOldSpecialitiesPage;
