"use client";

import useSWR from "swr";
import { IOldUser } from "../Doctor/AdminManageOldDoctorsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../../UI/HandleLoading";
import Table from "../../UI/Table";
import FormatDate from "@/Components/UI/FormatDate";

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
            _id: { name: "آی دی", value: (node) => node._id, filter: "Text" },
            phone: {
              name: "موبایل",
              value: (node) => node.phone,
              filter: "Text",
            },
            gender: {
              name: "جنسیت",
              value: (node) => node.gender,
              filter: "Set",
            },
            name: { name: "نام", value: (node) => node.name, filter: "Text" },
            firstName: {
              name: "نام کوچک",
              value: (node) => node.firstName,
              filter: "Text",
            },
            lastName: {
              name: "نام بزرگ",
              value: (node) => node.lastName,
              filter: "Text",
            },
            ssid: { name: "کدملی", value: (node) => node.ssid, filter: "Text" },
            exactBirth: {
              name: "تاریخ تولد",
              value: (node) =>
                node.exactBirth ? new Date(node.exactBirth) : "",
              component: (node) =>
                node.exactBirth ? <FormatDate value={node.exactBirth} /> : "",
              filter: "Date",
            },
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
          }}
        />
      )}
    </HandleLoading>
  );
};

export default AdminManageOldUsersPage;
