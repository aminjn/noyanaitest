"use client";

import { API } from "@/Components/config";
import { IInsurance } from "@/Components/DoctorPanel/Insurance/DoctorInsurancesTab";
import { fetcher } from "@/Components/helpers/fetcher";
import useSWR from "swr";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import usePopup from "@/Components/Hooks/usePopup";
import CreateInsurancePopup from "./CreateInsurancePopup";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import EditIcon from "@/Components/Icons/EditIcon";
import IconButton from "../UI/IconButton";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import DeleteInsurancePopup from "./DeleteInsurancePopup";
import OrderEditor from "../UI/OrderEditor";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageInsurancesPage = () => {
  const { data, error, mutate } = useSWR<IInsurance[]>(
    `${API}/auto/insurance`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={ta("بیمه ها")}
          actions={[
            {
              title: ta("جدید"),
              action: () =>
                setPopup(
                  "CreateInsurance",
                  <CreateInsurancePopup mutate={mutate} />,
                ),
            },
          ]}
        >
          <Table
            name="AdminManageInsurances"
            data={data}
            renderer={{
              name: {
                name: ta("نام"),
                value: (node) => node.name,
                component: (node) => (
                  <InlineLink href={adminPath(`/insurance/${node._id}`)}>
                    {node.name || node._id}
                  </InlineLink>
                ),
                filter: "Text",
              },
              active: {
                name: ta("فعال"),
                component: (node) => <BooleanToIcon value={node.active} />,
                value: (node) => booleanToValue[`${node.active}`],
                filter: "Set",
              },
              order: {
                name: ta("ترتیب"),
                value: (node) => node.order,
                filter: "Number",
                component: (node) => (
                  <OrderEditor
                    modelName="insurance"
                    _id={node._id}
                    value={node.order}
                    mutate={mutate}
                  />
                ),
              },
              actions: {
                name: ta("عملیات"),
                component: (node) => (
                  <TableActions>
                    <IconLink
                      href={adminPath(`/insurance/${node._id}`)}
                      title={ta("ویرایش")}
                    >
                      <EditIcon />
                    </IconLink>
                    <IconButton
                      variant="Danger"
                      title={ta("حذف")}
                      onClick={() =>
                        setPopup(
                          "DeleteInsurance",
                          <DeleteInsurancePopup node={node} mutate={mutate} />,
                        )
                      }
                    >
                      <GarbageIcon />
                    </IconButton>
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

export default AdminManageInsurancesPage;
