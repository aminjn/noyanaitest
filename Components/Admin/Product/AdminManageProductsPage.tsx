"use client";

import {
  IPharmacy,
  PharmacyPopulation,
} from "@/Components/DoctorPanel/Pharmacy/DoctorPharmaciesTab";
import { MongoDoc } from "@/Components/Hooks/useUser";
import {
  IProductCategory,
  ProductCategoryPopulation,
} from "../ProductCategory/AdminManageProductCategoriesPage";
import { Population } from "../Clinic/AdminManageClinicsPage";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import CreateForm from "../UI/CreateForm";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import { Fragment, useState } from "react";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import IconLink from "../UI/IconLink";
import EditIcon from "@/Components/Icons/EditIcon";
import { currencize } from "@/Components/helpers/currencize";
import { IProductPackage } from "../ProductPackage/AdminManageProductPackagesPage";
import { IServicePackage } from "../ServicePackage/AdminManageServicePackagesPage";
import { IService } from "../Service/AdminManageServicesPage";
import { IParaClinic } from "@/Components/Layout/ParaClinicPanelLayout";
import OrderEditor from "../UI/OrderEditor";
import { ta } from "@/Components/Admin/i18n/adminText";

export type ProductPopulation = Population<{
  Category: ProductCategoryPopulation;
  Images: ProductImagePopulation;
  Specs: ProductSpecPopulation;
  Sellers: ProductSellerPopulation;
  SameAs: ProductPopulation;
}>;

export interface IProduct<
  T extends ProductPopulation = ProductPopulation,
> extends MongoDoc {
  name?: string;
  slug?: string;
  order: number;
  isActive: boolean;
  summary?: string;
  description?: string;
  whyChoose?: string;
  details?: string;
  usage?: string;
  warning?: string;
  category?: T["Category"] extends ProductCategoryPopulation
    ? IProductCategory<T["Category"]>
    : string;
  images: T["Images"] extends ProductImagePopulation
    ? IProductImage<T["Images"]>[]
    : never;
  specs: T["Specs"] extends ProductSpecPopulation
    ? IProductSpec<T["Specs"]>[]
    : never;
  sellers: T["Sellers"] extends ProductSellerPopulation
    ? IProductSeller<T["Sellers"]>[]
    : never;
  image?: string;
  original?: string;
  sameAs: T["SameAs"] extends ProductPopulation
    ? IProduct<T["SameAs"]>[]
    : string[];
  price?: number;
  averageScore: number;
  commentCount: number;
}

export type ProductImagePopulation = Population<{ Product: ProductPopulation }>;

export interface IProductImage<
  T extends ProductImagePopulation = ProductImagePopulation,
> extends MongoDoc {
  product: T["Product"] extends ProductPopulation
    ? IProduct<T["Product"]>
    : string;
  image: string;
  alt?: string;
  order: number;
  isActive: boolean;
}

export type ProductSpecPopulation = Population<{ Product: ProductPopulation }>;

export const productSpecRefPaths = [
  "Product",
  "ProductPackage",
  "Service",
  "ServicePackage",
  "ParaClinic",
] as const;

export type ProductSpecRefPath = (typeof productSpecRefPaths)[number];

export type ProductSpecModel =
  | IProduct
  | IProductPackage
  | IService
  | IServicePackage
  | IParaClinic;

export interface IProductSpec<
  T extends ProductSpecPopulation = ProductSpecPopulation,
> extends MongoDoc {
  product: ProductSpecModel;
  refPath: ProductSpecRefPath;
  order: number;
  isActive: boolean;
  title?: string;
  content?: string;
}

export type ProductSellerPopulation = Population<{
  Product: ProductPopulation;
  Seller: PharmacyPopulation;
}>;

export interface IProductSeller<
  T extends ProductSellerPopulation = ProductSellerPopulation,
> extends MongoDoc {
  product: T["Product"] extends ProductPopulation
    ? IProduct<T["Product"]>
    : string;
  seller: T["Seller"] extends PharmacyPopulation
    ? IPharmacy<T["Seller"]>
    : string;
  order: number;
  isActive: boolean;
  price?: number;
  discount?: number;
  special: boolean;
  freeDelivery: boolean;
  fastDelivery: boolean;
}

const CreateProductPopup = ({ mutate }: { mutate: () => unknown }) => {
  const { closePopup } = usePopup();
  return (
    <PopupCard>
      <CreateForm<IProduct>
        onCancel={() => closePopup()}
        renderer={{
          name: { type: "text", title: ta("نام") },
          slug: { type: "text", title: ta("اسلاگ") },
          order: { type: "number", title: ta("رتبه") },
          isActive: { type: "bool", title: ta("فعال") },
          category: {
            title: ta("دسته بندی"),
            type: "nodes",
            path: `${API}/auto/productCategory`,
            multi: false,
            getOptionLabel: (node) =>
              (node as IProductCategory).name || (node as IProductCategory)._id,
            getOptionValue: (node) => (node as IProductCategory)._id,
          },
        }}
        hookProps={{
          path: `${API}/auto/product`,
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

const DeleteProductPopup = ({
  mutate,
  node,
}: {
  mutate: () => unknown;
  node: IProduct;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  return (
    <Fragment>
      <ConfirmationPopup
        message={ta("آیا از حذف این مورد مطمئنید؟")}
        isLoading={isLoading}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/auto/product/${node._id}` : null}
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

const AdminManageProductsPage = () => {
  const { data, error, mutate } = useSWR<
    IProduct<{
      Category: Record<never, never>;
    }>[]
  >(`${API}/auto/product`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={ta("محصولات")}
          actions={[
            {
              title: ta("جدید"),
              action: () =>
                setPopup(
                  "CreateProduct",
                  <CreateProductPopup mutate={mutate} />,
                ),
            },
          ]}
        >
          <Table
            name="AdminManageProducts"
            data={data}
            renderer={{
              name: { name: ta("نام"), value: (node) => node.name, filter: "Text" },
              category: {
                name: ta("دسته‌بندی"),
                value: (node) =>
                  node.category
                    ? node.category.name || node.category._id
                    : ta("ندارد"),
                filter: "Multi",
                component: (node) =>
                  node.category ? (
                    <InlineLink
                      href={adminPath(`/productCategory/${node.category._id}`)}
                    >
                      {node.category.name || node.category._id}
                    </InlineLink>
                  ) : (
                    ta("ندارد")
                  ),
              },
              price: {
                name: ta("قیمت (تومان)"),
                value: (node) => node.price,
                component: (node) =>
                  typeof node.price === "number" ? currencize(node.price) : "—",
                filter: "Number",
              },
              isActive: {
                name: ta("فعال"),
                value: (node) => booleanToValue[`${node.isActive}`],
                component: (node) => <BooleanToIcon value={node.isActive} />,
                filter: "Set",
              },
              order: {
                name: ta("ترتیب"),
                value: (node) => node.order,
                filter: "Number",
                component: (node) => (
                  <OrderEditor
                    value={node.order}
                    _id={node._id}
                    modelName="product"
                    mutate={mutate}
                  />
                ),
              },
              actions: {
                name: ta("عملیات"),
                component: (node) => (
                  <TableActions>
                    <IconLink
                      href={adminPath(`/product/${node._id}`)}
                      title={ta("ویرایش")}
                    >
                      <EditIcon />
                    </IconLink>
                    <IconButton
                      variant="Danger"
                      title={ta("حذف")}
                      onClick={() =>
                        setPopup(
                          "DeleteProduct",
                          <DeleteProductPopup mutate={mutate} node={node} />,
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

export default AdminManageProductsPage;
