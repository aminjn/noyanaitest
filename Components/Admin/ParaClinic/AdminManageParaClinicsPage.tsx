"use client";

import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { IParaClinic } from "@/Components/Layout/ParaClinicPanelLayout";
import useSWR from "swr";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import EditIcon from "@/Components/Icons/EditIcon";
import useProgress from "@/Components/Hooks/useProgress";
import OrderEditor from "../UI/OrderEditor";
import { providerStateColumn } from "../UI/ProviderStatus";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageParaClinicsPage = () => {
  const { data, error, mutate } = useSWR<
    IParaClinic<{ User: Record<never, never> }>[]
  >(`${API}/auto/paraClinic`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );

  const push = useProgress();

  return (
    <WithTitle
      title={ta("پاراکلینیک ها")}
      actions={[
        {
          title: ta("جدید"),
          // the full form, saved once (AdminRecordEditor)
          action: () => push(adminPath("/paraClinic/new")),
        },
      ]}
    >
      {!!data && (
        <Table
          data={data}
          name="AdminManageParaClinics"
          renderer={{
            name: {
              name: ta("نام"),
              value: (node) => node.name,
              filter: "Text",
            },
            user: {
              name: ta("کاربر"),
              filter: "Text",
              value: (node) => node.user?.phone,
              component: (node) =>
                node.user?._id ? (
                  <InlineLink href={adminPath(`/user/${node.user._id}`)}>
                    {node.user.phone || node.user._id}
                  </InlineLink>
                ) : (
                  "—"
                ),
            },
            // published / draft / suspended (Components/Admin/UI/ProviderStatus)
            active: providerStateColumn(),
            order: {
              name: ta("رتبه"),
              value: (node) => node.order,
              filter: "Number",
              component: (node) => (
                <OrderEditor
                  value={node.order}
                  modelName="paraClinic"
                  _id={node._id}
                  mutate={mutate}
                />
              ),
            },
            actions: {
              name: ta("عملیات"),
              component: (node) => (
                <TableActions>
                  <IconLink
                    href={adminPath(`/paraClinic/${node._id}`)}
                    title={ta("ویرایش")}
                  >
                    <EditIcon />
                  </IconLink>
                </TableActions>
              ),
            },
          }}
        />
      )}
    </WithTitle>
  );
};

export default AdminManageParaClinicsPage;
