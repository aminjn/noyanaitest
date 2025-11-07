"use client";

import useSWR from "swr";
import { IPart } from "../Disease/AdminManageDiseasesPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import usePopup from "@/Components/Hooks/usePopup";
import HandleLoading from "../UI/HandleLoading";
import Table from "../UI/Table";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import { adminPath } from "@/Components/helpers/adminPath";
import EditIcon from "@/Components/Icons/EditIcon";
import IconButton from "../UI/IconButton";
import DeletePartPopup from "./DeletePartPopup";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import WithTitle from "../UI/WithTitle";
import CreatePartPopup from "./CreatePartPopup";

const AdminManagePartsPage = () => {
  const { data, error, mutate } = useSWR<IPart[]>(
    `${API}/auto/part`,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title="اعضای بدن"
          actions={[
            {
              title: "جدید",
              action: () =>
                setPopup("CreatePart", <CreatePartPopup mutate={mutate} />),
            },
          ]}
        >
          <Table
            data={data}
            name="AdminManageParts"
            renderer={{
              name: { name: "نام", value: (node) => node.name, filter: "Text" },
              order: {
                name: "رتبه",
                value: (node) => node.order,
                filter: "Number",
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconLink href={adminPath(`/part/${node._id}`)}>
                      <EditIcon />
                    </IconLink>
                    <IconButton
                      variant="Danger"
                      onClick={() =>
                        setPopup(
                          "DeletePart",
                          <DeletePartPopup mutate={mutate} node={node} />
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

export default AdminManagePartsPage;
