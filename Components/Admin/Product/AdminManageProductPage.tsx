"use client";

import { useParams } from "next/navigation";
import useSWR, { mutate } from "swr";
import {
  IProduct,
  IProductImage,
  IProductSeller,
  IProductSpec,
} from "./AdminManageProductsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import TabSystem from "../UI/TabSystem";
import CreateForm from "../UI/CreateForm";
import Table from "../UI/Table";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import { IProductCategory } from "../ProductCategory/AdminManageProductCategoriesPage";
import InlineLink from "../UI/InlineLink";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import usePopup from "@/Components/Hooks/usePopup";
import { Fragment, useState } from "react";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import PopupCard from "@/Components/UI/PopupCard";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import EditIcon from "@/Components/Icons/EditIcon";
import { IPharmacy } from "@/Components/DoctorPanel/Pharmacy/DoctorPharmaciesTab";
import { adminPath } from "@/Components/helpers/adminPath";
import { currencize } from "@/Components/helpers/currencize";
import SpecsManager from "./SpecsManager";
import ImagesManager from "./ImagesManager";

const ProductDetailsManager = ({
  node,
  mutate,
}: {
  node: IProduct;
  mutate: () => unknown;
}) => {
  return (
    <CreateForm
      defaultValue={node}
      renderer={{
        name: { type: "text", title: "نام" },
        slug: { type: "text", title: "اسلاگ" },
        order: { type: "number", title: "رتبه" },
        isActive: { type: "bool", title: "فعال" },
        summary: { type: "text", title: "خلاصه" },
        whyChoose: { type: "text", title: "چرا این محصول" },
        description: { type: "rtf", title: "توضیحات" },
        details: { title: "مشخصات", type: "rtf" },
        usage: { title: "نحوه مصرف", type: "rtf" },
        warning: { title: "هشدار ها", type: "rtf" },
        category: {
          title: "دسته بندی",
          type: "nodes",
          multi: false,
          getOptionLabel: (node) =>
            (node as IProductCategory).name || (node as IProductCategory)._id,
          getOptionValue: (node) => (node as IProductCategory)._id,
          getDefaultValue: (inp) => inp.category,
          path: `${API}/auto/productCategory`,
        },
        image: { title: "نصویر", type: "image" },
        original: { title: "اصالت", type: "text" },
        sameAs: {
          title: "مشابهات",
          type: "nodes",
          path: `${API}/auto/product`,
          getOptionLabel: (node) =>
            (node as IProduct).name || (node as IProduct)._id,
          getOptionValue: (node) => (node as IProduct)._id,
          multi: true,
          getDefaultValue: (inp) => inp.sameAs,
        },
        price: { title: "قیمت پایه", type: "number" },
      }}
      hookProps={{
        path: `${API}/auto/product/${node._id}`,
        method: "POST",
        successCb: () => {
          mutate();
        },
      }}
    />
  );
};

const ProductImagesManager = ({ product }: { product: IProduct }) => {
  return <ImagesManager model="Product" node={product} />;
};

const ProductSpecsManager = ({ product }: { product: IProduct }) => {
  return <SpecsManager node={product} model="Product" />;
};

const DeleteProductSellerPopup = ({
  mutate,
  node,
}: {
  node: IProductSeller;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  return (
    <Fragment>
      <ConfirmationPopup
        onConfirm={() => setIsLoading(true)}
        isLoading={isLoading}
        message="آیا از حذف این مورد مطمئنید؟"
      />
      <Act
        path={isLoading ? `${API}/auto/productSeller/${node._id}` : null}
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

const MutateProductSellerPopup = ({
  mutate,
  node,
  product,
}: { mutate: () => unknown } & (
  | { node: IProductSeller<{ Seller: Record<never, never> }>; product?: never }
  | { product: IProduct; node?: never }
)) => {
  const { closePopup } = usePopup();

  return (
    <PopupCard>
      <CreateForm
        defaultValue={node}
        onCancel={() => closePopup()}
        renderer={{
          seller: {
            type: "nodes",
            title: "فروشنده",
            multi: false,
            path: `${API}/auto/pharmacy`,
            getOptionLabel: (node) =>
              (node as IPharmacy).name || (node as IPharmacy)._id,
            getOptionValue: (node) => (node as IPharmacy)._id,
            getDefaultValue: (inp) => inp.seller._id,
          },
          order: { type: "number", title: "رتبه" },
          isActive: { type: "bool", title: "فعال" },
          price: { type: "number", title: "قیمت" },
          discount: { type: "number", title: "تخفیف" },
          special: { type: "bool", title: "ویژه" },
          freeDelivery: { type: "bool", title: "ارسال رایگان" },
          fastDelivery: { type: "bool", title: "ارسال سریغ" },
        }}
        hookProps={{
          path: `${API}/auto/productSeller${node ? `/${node._id}` : ""}`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
          decorators: product ? { product: product._id } : undefined,
        }}
      />
    </PopupCard>
  );
};

const ProductSellersManager = ({ product }: { product: IProduct }) => {
  const { data, error, mutate } = useSWR<
    IProductSeller<{ Seller: Record<never, never> }>[]
  >(`${API}/auto/productSeller?product=${product._id}`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title="فروشندگان"
          actions={[
            {
              title: "جدید",
              action: () =>
                setPopup(
                  "MutateProductSeller",
                  <MutateProductSellerPopup
                    product={product}
                    mutate={mutate}
                  />,
                ),
            },
          ]}
        >
          <Table
            name="AdminManageProductSellers"
            data={data}
            renderer={{
              seller: {
                name: "فروشنده",
                value: (node) => node.seller.name || node.seller._id,
                component: (node) => (
                  <InlineLink href={adminPath(`/pharmacy/${node.seller._id}`)}>
                    {node.seller.name || node.seller._id}
                  </InlineLink>
                ),
                filter: "Multi",
              },
              order: {
                name: "رتبه",
                value: (node) => node.order,
                filter: "Number",
              },
              isActive: {
                name: "فعال",
                value: (node) => booleanToValue[`${node.isActive}`],
                component: (node) => <BooleanToIcon value={node.isActive} />,
                filter: "Set",
              },
              price: {
                name: "قیمت",
                value: (node) => node.price,
                component: (node) => (node.price ? currencize(node.price) : ""),
                filter: "Number",
              },
              discount: {
                name: "تخفیف",
                value: (node) => node.discount,
                component: (node) =>
                  node.discount ? currencize(node.discount) : "",
                filter: "Number",
              },
              fastDelivery: {
                name: "تحویل سریغ",
                value: (node) => booleanToValue[`${node.fastDelivery}`],
                filter: "Set",
                component: (node) => (
                  <BooleanToIcon value={node.fastDelivery} />
                ),
              },
              freeDelivery: {
                name: "ارسال رایگان",
                value: (node) => booleanToValue[`${node.freeDelivery}`],
                filter: "Set",
                component: (node) => (
                  <BooleanToIcon value={node.freeDelivery} />
                ),
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconButton
                      onClick={() =>
                        setPopup(
                          "DeleteSeller",
                          <DeleteProductSellerPopup
                            node={node}
                            mutate={mutate}
                          />,
                        )
                      }
                    >
                      <GarbageIcon />
                    </IconButton>
                    <IconButton
                      onClick={() =>
                        setPopup(
                          "MutateProductSeller",
                          <MutateProductSellerPopup
                            mutate={mutate}
                            node={node}
                          />,
                        )
                      }
                    >
                      <EditIcon />
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

const AdminManageProductPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<IProduct>(
    `${API}/auto/product/${nodeId}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={data.name || data._id}>
          <TabSystem
            name="AdminManageProduct"
            items={[
              {
                id: "Details",
                content: <ProductDetailsManager mutate={mutate} node={data} />,
                title: "جزئیات",
              },
              {
                id: "Images",
                content: <ProductImagesManager product={data} />,
                title: "تصاویر",
              },
              {
                id: "Specs",
                content: <ProductSpecsManager product={data} />,
                title: "ویژگی ها",
              },
              {
                id: "Sellers",
                content: <ProductSellersManager product={data} />,
                title: "فروشندگان",
              },
            ]}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageProductPage;
