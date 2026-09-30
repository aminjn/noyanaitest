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
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import TabSystem from "@/Components/Admin/UI/TabSystem";
import Table from "@/Components/Admin/UI/Table";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconButton from "@/Components/Admin/UI/IconButton";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import ConfirmationPopup from "@/Components/Admin/UI/ConfirmationPopup";
import PopupCard from "@/Components/UI/PopupCard";
import Act from "@/Components/UI/Act";
import BooleanToIcon from "@/Components/UI/BooleanToIcon";
import InlineLink from "@/Components/Admin/UI/InlineLink";
import PlusIcon from "@/Components/Icons/PlusIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import EditIcon from "@/Components/Icons/EditIcon";
import {
  IProduct,
  IProductSeller,
} from "@/Components/Admin/Product/AdminManageProductsPage";

const NS: ContentNamespace[] = ["common", "pharmacyPanelProduct"];

type MyProductSeller = IProductSeller<{
  Product: { Category: Record<never, never> };
}>;

type AvailableProduct = IProduct<{ Category: Record<never, never> }>;

// Fields a pharmacy is allowed to send when adding/editing its own ProductSeller.
// "special" (and ownership fields like product/seller/order) are intentionally excluded;
// the backend also rejects them outright via a strict schema.
type PharmacyEditableProductSellerFields = Pick<
  IProductSeller,
  "price" | "discount" | "isActive" | "freeDelivery" | "fastDelivery"
>;

const AddMyProductPopup = ({
  product,
  mutate,
}: {
  product: AvailableProduct;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();
  const getContent = useScopedLocale(NS);
  return (
    <PopupCard>
      <CreateForm<PharmacyEditableProductSellerFields>
        onCancel={() => closePopup()}
        renderer={{
          price: { type: "number", title: getContent("price"), price: true },
          discount: { type: "number", title: getContent("discount"), price: true },
          isActive: { type: "bool", title: getContent("isActive") },
          freeDelivery: { type: "bool", title: getContent("freeDelivery") },
          fastDelivery: { type: "bool", title: getContent("fastDelivery") },
        }}
        hookProps={{
          path: `${API}/pharmacy/myProduct`,
          method: "POST",
          decorators: { product: product._id },
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
      />
    </PopupCard>
  );
};

const EditMyProductPopup = ({
  node,
  mutate,
}: {
  node: MyProductSeller;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();
  const getContent = useScopedLocale(NS);
  return (
    <PopupCard>
      <CreateForm<PharmacyEditableProductSellerFields>
        defaultValue={node}
        onCancel={() => closePopup()}
        renderer={{
          price: { type: "number", title: getContent("price"), price: true },
          discount: { type: "number", title: getContent("discount"), price: true },
          isActive: { type: "bool", title: getContent("isActive") },
          freeDelivery: { type: "bool", title: getContent("freeDelivery") },
          fastDelivery: { type: "bool", title: getContent("fastDelivery") },
        }}
        hookProps={{
          path: `${API}/pharmacy/myProduct/${node._id}`,
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

const DeleteMyProductPopup = ({
  node,
  mutate,
}: {
  node: MyProductSeller;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  const getContent = useScopedLocale(NS);
  return (
    <Fragment>
      <ConfirmationPopup
        message={getContent("sureDeleteMyProduct")}
        isLoading={isLoading}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/pharmacy/myProduct/${node._id}` : null}
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

const PharmacyAvailableProductsTab = () => {
  const { data, error, mutate } = useSWR<AvailableProduct[]>(
    `${API}/pharmacy/product`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const { setPopup } = usePopup();
  const getContent = useScopedLocale(NS);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={getContent("availableProducts")}>
          <Table
            name="PharmacyAvailableProducts"
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
                name: getContent("basePrice"),
                value: (node) => node.price,
                component: (node) => (node.price ? currencize(node.price) : ""),
                filter: "Number",
              },
              actions: {
                name: getContent("actions"),
                component: (node) => (
                  <TableActions>
                    <IconButton
                      title={getContent("addProduct")}
                      onClick={() =>
                        setPopup(
                          "AddMyProduct",
                          <AddMyProductPopup product={node} mutate={mutate} />,
                        )
                      }
                    >
                      <PlusIcon />
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

const PharmacyMyProductsTab = () => {
  const { data, error, mutate } = useSWR<MyProductSeller[]>(
    `${API}/pharmacy/myProduct`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const { setPopup } = usePopup();
  const getContent = useScopedLocale(NS);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={getContent("myProducts")}>
          <Table
            name="PharmacyMyProducts"
            data={data}
            renderer={{
              name: {
                name: getContent("name"),
                value: (node) => node.product.name || node.product._id,
                filter: "Text",
                component: (node) =>
                  node.product.slug ? (
                    <InlineLink href={`/product/${node.product.slug}`}>
                      {node.product.name || node.product._id}
                    </InlineLink>
                  ) : (
                    node.product.name || node.product._id
                  ),
              },
              category: {
                name: getContent("category"),
                value: (node) =>
                  node.product.category
                    ? node.product.category.name || node.product.category._id
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
              isActive: {
                name: getContent("isActive"),
                value: (node) => getContent(node.isActive ? "active" : "inactive"),
                component: (node) => <BooleanToIcon value={node.isActive} />,
                filter: "Set",
              },
              special: {
                name: getContent("special"),
                value: (node) => getContent(node.special ? "yes" : "no"),
                component: (node) => <BooleanToIcon value={node.special} />,
                filter: "Set",
              },
              freeDelivery: {
                name: getContent("freeDelivery"),
                value: (node) => getContent(node.freeDelivery ? "yes" : "no"),
                component: (node) => (
                  <BooleanToIcon value={node.freeDelivery} />
                ),
                filter: "Set",
              },
              fastDelivery: {
                name: getContent("fastDelivery"),
                value: (node) => getContent(node.fastDelivery ? "yes" : "no"),
                component: (node) => (
                  <BooleanToIcon value={node.fastDelivery} />
                ),
                filter: "Set",
              },
              actions: {
                name: getContent("actions"),
                component: (node) => (
                  <TableActions>
                    <IconButton
                      onClick={() =>
                        setPopup(
                          "EditMyProduct",
                          <EditMyProductPopup node={node} mutate={mutate} />,
                        )
                      }
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      variant="Danger"
                      onClick={() =>
                        setPopup(
                          "DeleteMyProduct",
                          <DeleteMyProductPopup node={node} mutate={mutate} />,
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

const PharmacyProductsPage = () => {
  const getContent = useScopedLocale(NS);

  useBreadCrump([
    { title: getContent("dashboard"), target: "/pharmacypanel" },
    { title: getContent("products"), target: "/pharmacypanel/product" },
  ]);

  return (
    <TabSystem
      name="PharmacyProducts"
      items={[
        {
          id: "MyProducts",
          title: getContent("myProducts"),
          content: <PharmacyMyProductsTab />,
        },
        {
          id: "AvailableProducts",
          title: getContent("availableProducts"),
          content: <PharmacyAvailableProductsTab />,
        },
      ]}
    />
  );
};

export default PharmacyProductsPage;
