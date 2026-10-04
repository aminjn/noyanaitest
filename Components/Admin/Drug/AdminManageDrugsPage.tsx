"use client";

import useSWR from "swr";
import { IDrug } from "../Disease/AdminManageDiseasesPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import usePopup from "@/Components/Hooks/usePopup";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import IconLink from "../UI/IconLink";
import { adminPath } from "@/Components/helpers/adminPath";
import EditIcon from "@/Components/Icons/EditIcon";
import DeleteDrugPopup from "./DeleetDrugPopup";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import OrderEditor from "../UI/OrderEditor";
import { ta } from "@/Components/Admin/i18n/adminText";
import useProgress from "@/Components/Hooks/useProgress";

const AdminManageDrugsPage = () => {
  const { data, error, mutate } = useSWR<IDrug[]>(
    `${API}/auto/drug`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();
  const push = useProgress();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={ta("دارو ها")}
          actions={[
            {
              title: ta("جدید"),
              action: () => push(adminPath("/drug/new")),
            },
          ]}
        >
          <Table
            data={data}
            name="AdminManageDrugs"
            renderer={{
              name: { name: ta("نام"), value: (node) => node.name, filter: "Text" },
              brand: {
                name: ta("برند"),
                value: (node) => node.brand,
                filter: "Text",
              },
              dosageForm: {
                name: ta("شکل دارویی"),
                value: (node) => node.dosageForm,
                filter: "Set",
              },
              order: {
                name: ta("ترتیب"),
                value: (node) => node.order,
                filter: "Number",
                component: (node) => (
                  <OrderEditor
                    value={node.order}
                    modelName="drug"
                    mutate={mutate}
                    _id={node._id}
                  />
                ),
              },
              actions: {
                name: ta("عملیات"),
                component: (node) => (
                  <TableActions>
                    <IconLink
                      href={adminPath(`/drug/${node._id}`)}
                      title={ta("ویرایش")}
                    >
                      <EditIcon />
                    </IconLink>
                    <IconButton
                      variant="Danger"
                      title={ta("حذف")}
                      onClick={() =>
                        setPopup(
                          "DeleteDrug",
                          <DeleteDrugPopup node={node} mutate={mutate} />,
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

export default AdminManageDrugsPage;
