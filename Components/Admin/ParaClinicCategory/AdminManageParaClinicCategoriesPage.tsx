"use client";

import useSWR, { mutate } from "swr";
import { Population } from "../Clinic/AdminManageClinicsPage";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import usePopup from "@/Components/Hooks/usePopup";
import { Fragment, useState } from "react";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import PopupCard from "@/Components/UI/PopupCard";
import CreateForm from "../UI/CreateForm";
import Table from "../UI/Table";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import IconLink from "../UI/IconLink";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import { adminPath } from "@/Components/helpers/adminPath";
import EditIcon from "@/Components/Icons/EditIcon";
import OrderEditor from "../UI/OrderEditor";
import { ta } from "@/Components/Admin/i18n/adminText";

export type ParaClinicCategoryPopulation = Population<Record<never, never>>;

export interface IParaClinicCategory<
  T extends ParaClinicCategoryPopulation = ParaClinicCategoryPopulation,
> extends MongoDoc {
  name?: string;
  order: number;
  isActive: boolean;
  slug?: string;
}

const DeleteParaClinicCategoryPopup = ({
  mutate,
  node,
}: {
  node: IParaClinicCategory;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  return (
    <Fragment>
      <ConfirmationPopup
        onConfirm={() => setIsLoading(true)}
        message={ta("آیا از حذف این مورد مطمئنید؟")}
        isLoading={isLoading}
      />
      <Act
        path={isLoading ? `${API}/auto/paraClinicCategory/${node._id}` : null}
        method="PUT"
        onDone={(status) => {
          setIsLoading(false);
          if (!status) return;
          mutate();
          closePopup();
        }}
      />
    </Fragment>
  );
};

const CreateParaClinicCategoryPopup = ({
  mutate,
}: {
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();

  return (
    <PopupCard>
      <CreateForm<IParaClinicCategory>
        onCancel={() => {
          closePopup();
        }}
        renderer={{
          name: { type: "text", title: ta("نام") },
          isActive: { title: ta("فعال"), type: "bool" },
          order: { title: ta("رتبه"), type: "number" },
        }}
        hookProps={{
          path: `${API}/auto/paraClinicCategory`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
      />
    </PopupCard>
  );
};

const AdminManageParaClinicCategoriesPage = () => {
  const { data, error, mutate } = useSWR<IParaClinicCategory[]>(
    `${API}/auto/paraClinicCategory`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={ta("دسته بندی پاراکلینیک")}
          actions={[
            {
              title: ta("جدید"),
              action: () =>
                setPopup(
                  "CreateParaClinicCategory",
                  <CreateParaClinicCategoryPopup mutate={mutate} />,
                ),
            },
          ]}
        >
          <Table
            data={data}
            name="AdminManageParaClinicCategories"
            renderer={{
              name: { name: ta("نام"), value: (node) => node.name, filter: "Text" },
              isActive: {
                name: ta("وضعیت"),
                value: (node) => booleanToValue[`${node.isActive}`],
                component: (node) => <BooleanToIcon value={node.isActive} />,
                filter: "Set",
              },
              order: {
                name: ta("رتبه"),
                value: (node) => node.order,
                filter: "Number",
                component: (node) => (
                  <OrderEditor
                    modelName="paraClinicCategory"
                    mutate={mutate}
                    value={node.order}
                    _id={node._id}
                  />
                ),
              },
              actions: {
                name: ta("عملیات"),
                component: (node) => (
                  <TableActions>
                    <IconLink
                      href={adminPath(`/paraClinicCategory/${node._id}`)}
                      title={ta("ویرایش")}
                    >
                      <EditIcon />
                    </IconLink>
                    <IconButton
                      variant="Danger"
                      title={ta("حذف")}
                      onClick={() =>
                        setPopup(
                          "DeleteParaClinicCategory",
                          <DeleteParaClinicCategoryPopup
                            node={node}
                            mutate={mutate}
                          />,
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

export default AdminManageParaClinicCategoriesPage;
