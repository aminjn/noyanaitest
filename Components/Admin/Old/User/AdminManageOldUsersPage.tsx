"use client";

import useSWR from "swr";
import { IOldUser } from "../Doctor/AdminManageOldDoctorsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../../UI/HandleLoading";
import Table from "../../UI/Table";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageOldUsersPage = () => {
  const { data, error } = useSWR<IOldUser[]>(`${API}/old/user`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data)
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <Table
          data={data}
          name="AdminManageOldUsers"
          renderer={{
            name: {
              name: ta("نام"),
              value: (node) =>
                node.name ||
                [node.firstName, node.lastName].filter(Boolean).join(" "),
              filter: "Text",
            },
            phone: {
              name: ta("موبایل"),
              value: (node) => node.phone,
              filter: "Text",
            },
            ssid: { name: ta("کد ملی"), value: (node) => node.ssid, filter: "Text" },
            license: {
              name: ta("اشتراک"),
              value: (node) => node.license,
              filter: "Set",
            },
            balance: {
              name: ta("مانده حساب"),
              value: (node) => node.balance,
              filter: "Number",
            },
            gender: {
              name: ta("جنسیت"),
              value: (node) => node.gender,
              filter: "Set",
            },
          }}
        />
      )}
    </HandleLoading>
  );
};

export default AdminManageOldUsersPage;
