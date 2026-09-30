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
import OrderEditor from "../UI/OrderEditor";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManagePartsPage = () => {
  const { data, error, mutate } = useSWR<IPart[]>(
    `${API}/auto/part`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={ta("اعضای بدن")}
          actions={[
            {
              title: ta("جدید"),
              action: () =>
                setPopup("CreatePart", <CreatePartPopup mutate={mutate} />),
            },
          ]}
        >
          <Table
            data={data}
            name="AdminManageParts"
            renderer={{
              name: { name: ta("نام"), value: (node) => node.name, filter: "Text" },
              order: {
                name: ta("رتبه"),
                value: (node) => node.order,
                filter: "Number",
                component: (node) => (
                  <OrderEditor
                    _id={node._id}
                    modelName="part"
                    mutate={mutate}
                    value={node.order}
                  />
                ),
              },
              actions: {
                name: ta("عملیات"),
                component: (node) => (
                  <TableActions>
                    <IconLink
                      href={adminPath(`/part/${node._id}`)}
                      title={ta("ویرایش")}
                    >
                      <EditIcon />
                    </IconLink>
                    <IconButton
                      variant="Danger"
                      title={ta("حذف")}
                      onClick={() =>
                        setPopup(
                          "DeletePart",
                          <DeletePartPopup mutate={mutate} node={node} />,
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
