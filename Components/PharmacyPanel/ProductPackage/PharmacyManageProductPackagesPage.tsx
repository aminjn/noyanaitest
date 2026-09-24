"use client";

import { Fragment, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { currencize } from "@/Components/helpers/currencize";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import usePopup from "@/Components/Hooks/usePopup";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { MongoDoc } from "@/Components/Hooks/useUser";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import Table from "@/Components/Admin/UI/Table";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconButton from "@/Components/Admin/UI/IconButton";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import ConfirmationPopup from "@/Components/Admin/UI/ConfirmationPopup";
import PopupCard from "@/Components/UI/PopupCard";
import Act from "@/Components/UI/Act";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import EditIcon from "@/Components/Icons/EditIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import {
  IProduct,
  IProductSeller,
} from "@/Components/Admin/Product/AdminManageProductsPage";
import { IProductCategory } from "@/Components/Admin/ProductCategory/AdminManageProductCategoriesPage";

const NS: ContentNamespace[] = ["common", "pharmacyPanelProductPackage"];

// Products this pharmacy actually sells (used as the source list when picking
// which products go in a package) come back as ProductSeller docs.
type MyProductSeller = IProductSeller<{
  Product: { Category: Record<never, never> };
}>;

type PackageProduct = IProduct<{ Category: Record<never, never> }>;

export interface IPharmacyProductPackage extends MongoDoc {
  name?: string;
  slug?: string;
  isActive: boolean;
  order: number;
  category?: IProductCategory;
  image?: string;
  products: PackageProduct[];
  price?: number;
  discount?: number;
  summary?: string;
  description?: string;
  whyChoose?: string;
}

// Shape actually submitted to the pharmacy/productPackage endpoints: relations
// are plain ids, not the populated objects the list view works with.
type ProductPackageMutateFields = {
  name?: string;
  category?: string;
  image?: string;
  products?: string[];
  price?: number;
  discount?: number;
  summary?: string;
  description?: string;
  whyChoose?: string;
  isActive?: boolean;
  order?: number;
};

const ProductPackageMutatePopup = ({
  node,
  mutate,
}: {
  node?: IPharmacyProductPackage;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();
  const getContent = useScopedLocale(NS);

  const defaultValue: ProductPackageMutateFields | undefined = node
    ? {
        name: node.name,
        category: node.category?._id,
        image: node.image,
        products: node.products.map((p) => p._id),
        price: node.price,
        discount: node.discount,
        summary: node.summary,
        description: node.description,
        whyChoose: node.whyChoose,
        isActive: node.isActive,
        order: node.order,
      }
    : undefined;

  return (
    <PopupCard>
      <CreateForm<ProductPackageMutateFields>
        defaultValue={defaultValue}
        onCancel={() => closePopup()}
        renderer={{
          name: { type: "text", title: getContent("name") },
          category: {
            type: "nodes",
            title: getContent("category"),
            path: `${API}/pharmacy/productPackageCategory`,
            dataParser: (res) => (res as { data: IProductCategory[] }).data,
            getOptionLabel: (opt) =>
              (opt as IProductCategory).name || (opt as IProductCategory)._id,
            getOptionValue: (opt) => (opt as IProductCategory)._id,
            getDefaultValue: (inp) => inp.category,
            multi: false,
            clearable: true,
          },
          image: { type: "image", title: getContent("image") },
          products: {
            type: "nodes",
            title: getContent("products"),
            path: `${API}/pharmacy/myProduct`,
            dataParser: (res) =>
              (res as { data: MyProductSeller[] }).data.map((s) => s.product),
            getOptionLabel: (opt) =>
              (opt as PackageProduct).name || (opt as PackageProduct)._id,
            getOptionValue: (opt) => (opt as PackageProduct)._id,
            getDefaultValue: (inp) => inp.products,
            multi: true,
          },
          price: { type: "number", title: getContent("price"), price: true },
          discount: {
            type: "number",
            title: getContent("discount"),
            price: true,
          },
          summary: { type: "text", title: getContent("summary") },
          description: { type: "rtf", title: getContent("description") },
          whyChoose: { type: "text", title: getContent("whyChoose") },
          order: { type: "number", title: getContent("order") },
          isActive: { type: "bool", title: getContent("isActive") },
        }}
        hookProps={{
          path: `${API}/pharmacy/productPackage${node ? `/${node._id}` : ""}`,
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

const DeleteProductPackagePopup = ({
  node,
  mutate,
}: {
  node: IPharmacyProductPackage;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  const getContent = useScopedLocale(NS);

  return (
    <Fragment>
      <ConfirmationPopup
        message={getContent("sureDeleteProductPackage")}
        isLoading={isLoading}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/pharmacy/productPackage/${node._id}` : null}
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

const PharmacyManageProductPackagesPage = () => {
  const { data, error, mutate } = useSWR<IPharmacyProductPackage[]>(
    `${API}/pharmacy/productPackage`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const { setPopup } = usePopup();
  const getContent = useScopedLocale(NS);

  useBreadCrump([
    { title: getContent("dashboard"), target: "/pharmacypanel" },
    {
      title: getContent("productPackages"),
      target: "/pharmacypanel/productPackage",
    },
  ]);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={getContent("productPackages")}
          actions={[
            {
              title: getContent("newItem"),
              action: () =>
                setPopup(
                  "MutateProductPackage",
                  <ProductPackageMutatePopup mutate={mutate} />,
                ),
            },
          ]}
        >
          <Table
            name="PharmacyManageProductPackages"
            data={data}
            renderer={{
              name: {
                name: getContent("name"),
                value: (node) => node.name,
                filter: "Text",
              },
              category: {
                name: getContent("category"),
                value: (node) =>
                  node.category
                    ? node.category.name || node.category._id
                    : getContent("unset"),
                filter: "Multi",
              },
              price: {
                name: getContent("price"),
                value: (node) => node.price,
                component: (node) => (node.price ? currencize(node.price) : ""),
                filter: "Number",
              },
              discount: {
                name: getContent("discount"),
                value: (node) => node.discount,
                component: (node) =>
                  node.discount ? currencize(node.discount) : "",
                filter: "Number",
              },
              products: {
                name: getContent("products"),
                value: (node) => node.products.length,
                filter: "Number",
              },
              order: {
                name: getContent("order"),
                value: (node) => node.order,
                filter: "Number",
              },
              isActive: {
                name: getContent("isActive"),
                value: (node) => booleanToValue[`${node.isActive}`],
                component: (node) => <BooleanToIcon value={node.isActive} />,
                filter: "Set",
              },
              actions: {
                name: getContent("actions"),
                component: (node) => (
                  <TableActions>
                    <IconButton
                      onClick={() =>
                        setPopup(
                          "MutateProductPackage",
                          <ProductPackageMutatePopup
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
                      onClick={() =>
                        setPopup(
                          "DeleteProductPackage",
                          <DeleteProductPackagePopup
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

export default PharmacyManageProductPackagesPage;
