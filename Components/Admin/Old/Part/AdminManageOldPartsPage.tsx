"use client";
import useSWR from "swr";
import classes from "./AdminManageOldPartsPage.module.css";
import { IOldPart } from "../Doctor/AdminManageOldDoctorsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../../UI/HandleLoading";
import Table from "../../UI/Table";

const AdminManageOldPartsPage = () => {
  const { data, error } = useSWR<IOldPart[]>(`${API}/old/part`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data)
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <Table
          data={data}
          name="AdminManageOldParts"
          renderer={{
            name: { name: "نام", value: (node) => node.name, filter: "Text" },
            order: {
              name: "رتبه",
              value: (node) => node.order,
              filter: "Number",
            },
            _id: { name: "شناسه", value: (node) => node._id, filter: "Text" },
          }}
        />
      )}
    </HandleLoading>
  );
};

export default AdminManageOldPartsPage;
