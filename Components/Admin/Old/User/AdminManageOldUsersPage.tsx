"use client";

import useSWR from "swr";
import { IOldUser } from "../Doctor/AdminManageOldDoctorsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../../UI/HandleLoading";
import Table from "../../UI/Table";

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
              name: "نام",
              value: (node) =>
                node.name ||
                [node.firstName, node.lastName].filter(Boolean).join(" "),
              filter: "Text",
            },
            phone: {
              name: "موبایل",
              value: (node) => node.phone,
              filter: "Text",
            },
            ssid: { name: "کد ملی", value: (node) => node.ssid, filter: "Text" },
            license: {
              name: "اشتراک",
              value: (node) => node.license,
              filter: "Set",
            },
            balance: {
              name: "مانده حساب",
              value: (node) => node.balance,
              filter: "Number",
            },
            gender: {
              name: "جنسیت",
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
