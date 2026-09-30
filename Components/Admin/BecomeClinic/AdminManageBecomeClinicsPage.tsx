"use client";

import { IBecomeClinicRequest } from "@/Components/ClinicPanel/BecomeClinicPage";
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
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageBecomeClinicsPage = () => {
  const { data, error } = useSWR<IBecomeClinicRequest<{ user: true }>[]>(
    `${API}/auto/becomeclinic`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={ta("درخواست های کلینیک شدن")}>
          <Table
            data={data}
            name="AdminManageBecomeClinics"
            renderer={{
              name: { name: ta("نام"), value: (node) => node.name, filter: "Text" },
              user: {
                name: ta("کاربر"),
                value: (node) => node.user?.phone || ta("حذف شده"),
                component: (node) =>
                  node.user ? (
                    <InlineLink href={adminPath(`/user/${node.user._id}`)}>
                      {node.user.phone}
                    </InlineLink>
                  ) : (
                    ta("حذف شده")
                  ),
                filter: "Text",
              },
              status: {
                name: ta("وضعیت"),
                value: (node) => becomeNodeStatusesDict[node.status],
                filter: "Set",
              },
              siamCode: {
                name: ta("کد سیام"),
                value: (node) => node.siamCode,
                filter: "Text",
              },
              nationalId: {
                name: ta("کد ملی"),
                value: (node) => node.nationalId,
                filter: "Text",
              },
              createdAt: {
                name: ta("تاریخ ثبت"),
                value: (node) => new Date(node.createdAt),
                filter: "Date",
              },
              actions: {
                name: ta("عملیات"),
                component: (node) => (
                  <TableActions>
                    <IconLink
                      href={adminPath(`/becomeclinic/${node._id}`)}
                      title={ta("بررسی")}
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

export default AdminManageBecomeClinicsPage;
