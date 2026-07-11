"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import PopupCard from "@/Components/UI/PopupCard";
import usePopup from "@/Components/Hooks/usePopup";
import useProgress from "@/Components/Hooks/useProgress";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import { Fragment, useState } from "react";
import Act from "@/Components/UI/Act";
import CreateForm from "../UI/CreateForm";
import Table from "../UI/Table";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import IconLink from "../UI/IconLink";
import { adminPath } from "@/Components/helpers/adminPath";
import EyeIcon from "@/Components/Icons/EyeIcon";

export type ProductCategoryPopulation = Population<Record<never, never>>;

export interface IProductCategory<
  T extends ProductCategoryPopulation = ProductCategoryPopulation,
> extends MongoDoc {
  name?: string;
  order: number;
  isActive: boolean;
}

const CreateProductCategoryPopup = ({ mutate }: { mutate: () => unknown }) => {
  const { closePopup } = usePopup();
  return (
    <PopupCard>
      <CreateForm<IProductCategory>
        renderer={{
          name: { title: "نام", type: "text" },
          isActive: { type: "bool", title: "فعال" },
          order: { type: "number", title: "رتبه" },
        }}
        hookProps={{
          path: `${API}/auto/productCategory`,
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

const DeleteProductCategoryPopup = ({
  mutate,
  node,
}: {
  node: IProductCategory;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { closePopup } = usePopup();

  return (
    <Fragment>
      <ConfirmationPopup
        isLoading={isLoading}
        message="ایا از حذف این مورد مطمئنید؟"
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/auto/productCategory/${node._id}` : null}
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

const AdminManageProductCategoriesPage = () => {
  const { data, error, mutate } = useSWR<IProductCategory[]>(
    `${API}/auto/productCategory`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title="دسته بندی محصولات"
          actions={[
            {
              title: "جدید",
              action: () =>
                setPopup(
                  "CreateProductCategory",
                  <CreateProductCategoryPopup mutate={mutate} />,
                ),
            },
          ]}
        >
          <Table
            data={data}
            renderer={{
              name: { name: "نام", value: (node) => node.name, filter: "Text" },
              isActive: {
                name: "فعال",
                value: (node) => booleanToValue[`${node.isActive}`],
                filter: "Set",
                component: (node) => <BooleanToIcon value={node.isActive} />,
              },
              order: {
                name: "رتبه",
                filter: "Number",
                value: (node) => node.order,
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconLink href={adminPath(`/productCategory/${node._id}`)}>
                      <EyeIcon />
                    </IconLink>
                    <IconButton
                      onClick={() =>
                        setPopup(
                          "DeleteProductCategory",
                          <DeleteProductCategoryPopup
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
            name="AdminManageProductCategories"
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageProductCategoriesPage;
