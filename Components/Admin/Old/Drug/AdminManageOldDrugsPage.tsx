"use client";

import useSWR from "swr";
import classes from "./AdminManageOldDrugsPage.module.css";
import { IOldDrug } from "../Doctor/AdminManageOldDoctorsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../../UI/HandleLoading";
import Table from "../../UI/Table";
import { ta } from "@/Components/Admin/i18n/adminText";

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
            name: { name: ta("نام"), value: (node) => node.name, filter: "Text" },
            alternateName: {
              name: ta("نام دیگر"),
              value: (node) => node.alternateName,
              filter: "Text",
            },
            activeIngridient: {
              name: ta("ماده مؤثره"),
              value: (node) => node.activeIngridient,
              filter: "Text",
            },
            dosageForm: {
              name: ta("شکل دارویی"),
              value: (node) => node.dosageForm,
              filter: "Multi",
            },
            adminstrationRoute: {
              name: ta("طریقه مصرف"),
              value: (node) => node.adminstrationRoute,
              filter: "Multi",
            },
            prescriptionStatus: {
              name: ta("وضعیت نسخه"),
              value: (node) => node.prescriptionStatus,
              filter: "Set",
            },
          }}
          name="AdminManageOldDrugs"
        />
      )}
    </HandleLoading>
  );
};

export default AdminManageOldDrugsPage;
