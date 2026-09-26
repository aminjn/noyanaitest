"use client";

import { IBecomeHospitalRequest } from "@/Components/HospitalPanel/BecomeHospitalPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useSWR from "swr";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import { becomeNodeStatusesDict } from "@/Components/DoctorPanel/DoctorPanelPage";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import EditIcon from "@/Components/Icons/EditIcon";

const AdminManageBecomeHospitalsPage = () => {
  const { data, error } = useSWR<IBecomeHospitalRequest<{ user: true }>[]>(
    `${API}/auto/becomehospital`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title="درخواست های بیمارستان شدن">
          <Table
            data={data}
            name="AdminManageBecomeHospitals"
            renderer={{
              name: { name: "نام", value: (node) => node.name, filter: "Text" },
              user: {
                name: "کاربر",
                value: (node) => node.user?.phone || "حذف شده",
                component: (node) =>
                  node.user ? (
                    <InlineLink href={adminPath(`/user/${node.user._id}`)}>
                      {node.user.phone}
                    </InlineLink>
                  ) : (
                    "حذف شده"
                  ),
                filter: "Text",
              },
              status: {
                name: "وضعیت",
                value: (node) => becomeNodeStatusesDict[node.status],
                filter: "Set",
              },
              siamCode: {
                name: "کد سیام",
                value: (node) => node.siamCode,
                filter: "Text",
              },
              nationalId: {
                name: "کد ملی",
                value: (node) => node.nationalId,
                filter: "Text",
              },
              createdAt: {
                name: "تاریخ ایجاد",
                value: (node) => new Date(node.createdAt),
                filter: "Date",
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconLink
                      href={adminPath(`/becomehospital/${node._id}`)}
                      title="بررسی و ویرایش"
                    >
                      <EditIcon />
                    </IconLink>
                  </TableActions>
                ),
              },
            }}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageBecomeHospitalsPage;
