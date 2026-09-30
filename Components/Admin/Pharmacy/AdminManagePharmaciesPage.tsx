"use client";

import { API } from "@/Components/config";
import { IPharmacy } from "@/Components/DoctorPanel/Pharmacy/DoctorPharmaciesTab";
import { fetcher } from "@/Components/helpers/fetcher";
import useSWR from "swr";
import HandleLoading from "../UI/HandleLoading";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import IconLink from "../UI/IconLink";
import EditIcon from "@/Components/Icons/EditIcon";
import usePopup from "@/Components/Hooks/usePopup";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import DeletePharmacyPopup from "./DeletePharmacyPopup";
import WithTitle from "../UI/WithTitle";
import CreatePharmacyPopup from "./CreatePharmacyPopup";
import OrderEditor from "../UI/OrderEditor";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManagePharmaciesPage = () => {
  const { data, error, mutate } = useSWR<IPharmacy[]>(
    `${API}/auto/pharmacy`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={ta("داروخانه ها و آزمایشگاه ها")}
          actions={[
            {
              title: ta("جدید"),
              action: () =>
                setPopup(
                  "CreatePharmacy",
                  <CreatePharmacyPopup mutate={mutate} />,
                ),
            },
          ]}
        >
          <Table
            name="AdminManagePharmacies"
            data={data}
            renderer={{
              name: {
                name: ta("نام"),
                value: (node) => node.name,
                component: (node) => (
                  <InlineLink href={adminPath(`/pharmacy/${node._id}`)}>
                    {node.name || node._id}
                  </InlineLink>
                ),
                filter: "Text",
              },
              active: {
                name: ta("وضعیت"),
                value: (node) => booleanToValue[`${node.active}`],
                component: (node) => <BooleanToIcon value={node.active} />,
                filter: "Set",
              },
              order: {
                name: ta("ترتیب"),
                value: (node) => node.order,
                filter: "Number",
                component: (node) => (
                  <OrderEditor
                    value={node.order}
                    modelName="pharmacy"
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
                      href={adminPath(`/pharmacy/${node._id}`)}
                      title={ta("ویرایش")}
                    >
                      <EditIcon />
                    </IconLink>
                    <IconButton
                      variant="Danger"
                      title={ta("حذف")}
                      onClick={() =>
                        setPopup(
                          "DeletePharmacy",
                          <DeletePharmacyPopup mutate={mutate} node={node} />,
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

export default AdminManagePharmaciesPage;
