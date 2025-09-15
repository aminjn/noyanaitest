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

const AdminManagePharmaciesPage = () => {
  const { data, error, mutate } = useSWR<IPharmacy[]>(
    `${API}/auto/pharmacy`,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title="داروخانه ها و آزمایشگاه ها"
          actions={[
            {
              title: "جدید",
              action: () =>
                setPopup(
                  "CreatePharmacy",
                  <CreatePharmacyPopup mutate={mutate} />
                ),
            },
          ]}
        >
          <Table
            name="AdminManagePharmacies"
            data={data}
            renderer={{
              name: {
                name: "نام",
                value: (node) => node.name,
                component: (node) => (
                  <InlineLink href={adminPath(`/pharmacy/${node._id}`)}>
                    {node.name || node._id}
                  </InlineLink>
                ),
                filter: "Text",
              },
              order: {
                name: "رتبه",
                value: (node) => node.order,
                filter: "Number",
              },
              active: {
                name: "فعال",
                value: (node) => booleanToValue[`${node.active}`],
                component: (node) => <BooleanToIcon value={node.active} />,
                filter: "Set",
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconLink href={adminPath(`/pharmacy/${node._id}`)}>
                      <EditIcon />
                    </IconLink>
                    <IconButton
                      onClick={() =>
                        setPopup(
                          "DeletePharmacy",
                          <DeletePharmacyPopup mutate={mutate} node={node} />
                        )
                      }
                      variant="Danger"
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
