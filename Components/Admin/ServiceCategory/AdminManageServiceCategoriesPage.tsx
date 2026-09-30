"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import useSWR, { mutate } from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import PopupCard from "@/Components/UI/PopupCard";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import { Fragment, useState } from "react";
import usePopup from "@/Components/Hooks/usePopup";
import Act from "@/Components/UI/Act";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import EditIcon from "@/Components/Icons/EditIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import CreateForm from "../UI/CreateForm";
import OrderEditor from "../UI/OrderEditor";
import { ta } from "@/Components/Admin/i18n/adminText";

export type ServiceCategoryPopulation = Population<Record<never, never>>;
export interface IServiceCategory<
  T extends ServiceCategoryPopulation = ServiceCategoryPopulation,
> extends MongoDoc {
  title?: string;
  isActive: boolean;
  order: number;
  slug?: string;
}

const MutateServiceCategoryPopup = ({
  mutate,
  node,
}: {
  node?: IServiceCategory;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();

  return (
    <PopupCard title={node ? ta("ویرایش دسته‌ی خدمات") : ta("دسته‌ی خدمات جدید")}>
      <CreateForm
        defaultValue={node}
        renderer={{
          title: { title: ta("عنوان"), type: "text" },
          isActive: { title: ta("فعال"), type: "bool" },
          order: { title: ta("رتبه"), type: "number" },
          slug: { title: ta("اسلاگ"), type: "text" },
        }}
        hookProps={{
          path: `${API}/auto/serviceCategory${!!node ? `/${node._id}` : ""}`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
        onCancel={() => closePopup()}
      />
    </PopupCard>
  );
};

const DeleteServiceCategoryPopup = ({
  mutate,
  node,
}: {
  node: IServiceCategory;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { closePopup } = usePopup();

  return (
    <Fragment>
      <ConfirmationPopup
        onConfirm={() => setIsLoading(true)}
        isLoading={isLoading}
        message={ta("آیا از حذف این آیتم مطمئنید؟")}
      />
      <Act
        path={isLoading ? `${API}/auto/serviceCategory/${node._id}` : null}
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

const AdminManageServiceCategoriesPage = () => {
  const { data, error, mutate } = useSWR<IServiceCategory[]>(
    `${API}/auto/serviceCategory`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={ta("دسته بندی های خدمات")}
          actions={[
            {
              title: ta("جدید"),
              action: () =>
                setPopup(
                  "MutateServiceCategory",
                  <MutateServiceCategoryPopup mutate={mutate} />,
                ),
            },
          ]}
        >
          <Table
            data={data}
            name="AdminManageServiceCategories"
            renderer={{
              title: {
                name: ta("عنوان"),
                value: (node) => node.title,
                filter: "Text",
              },
              isActive: {
                name: ta("فعال"),
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
                    _id={node._id}
                    value={node.order}
                    mutate={mutate}
                    modelName="serviceCategory"
                  />
                ),
              },
              actions: {
                name: ta("عملیات"),
                component: (node) => (
                  <TableActions>
                    <IconButton
                      title={ta("ویرایش")}
                      onClick={() =>
                        setPopup(
                          "MutateServiceCategory",
                          <MutateServiceCategoryPopup
                            node={node}
                            mutate={mutate}
                          />,
                        )
                      }
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      variant="Danger"
                      title={ta("حذف")}
                      onClick={() =>
                        setPopup(
                          "DeleteServiceCategory",
                          <DeleteServiceCategoryPopup
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

export default AdminManageServiceCategoriesPage;
