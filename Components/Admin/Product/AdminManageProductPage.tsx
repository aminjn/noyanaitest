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
import PageMetaEditor from "../PageMeta/PageMetaEditor";
import OrderEditor from "../UI/OrderEditor";
import { ta } from "@/Components/Admin/i18n/adminText";

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
        name: { type: "text", title: ta("نام") },
        slug: { type: "text", title: ta("اسلاگ") },
        order: { type: "number", title: ta("رتبه") },
        isActive: { type: "bool", title: ta("فعال") },
        summary: { type: "text", title: ta("خلاصه") },
        whyChoose: { type: "text", title: ta("چرا این محصول") },
        description: { type: "rtf", title: ta("توضیحات") },
        details: { title: ta("مشخصات"), type: "rtf" },
        usage: { title: ta("نحوه مصرف"), type: "rtf" },
        warning: { title: ta("هشدار ها"), type: "rtf" },
        category: {
          title: ta("دسته بندی"),
          type: "nodes",
          multi: false,
          getOptionLabel: (node) =>
            (node as IProductCategory).name || (node as IProductCategory)._id,
          getOptionValue: (node) => (node as IProductCategory)._id,
          getDefaultValue: (inp) => inp.category,
          path: `${API}/auto/productCategory`,
          creatable: { path: `${API}/auto/productCategory` },
        },
        image: { title: ta("نصویر"), type: "image" },
        original: { title: ta("اصالت"), type: "text" },
        sameAs: {
          title: ta("مشابهات"),
          type: "nodes",
          path: `${API}/auto/product`,
          getOptionLabel: (node) =>
            (node as IProduct).name || (node as IProduct)._id,
          getOptionValue: (node) => (node as IProduct)._id,
          multi: true,
          getDefaultValue: (inp) => inp.sameAs,
        },
        price: { title: ta("قیمت پایه"), type: "number" },
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
        message={ta("آیا از حذف این مورد مطمئنید؟")}
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
            title: ta("فروشنده"),
            multi: false,
            path: `${API}/auto/pharmacy`,
            getOptionLabel: (node) =>
              (node as IPharmacy).name || (node as IPharmacy)._id,
            getOptionValue: (node) => (node as IPharmacy)._id,
            getDefaultValue: (inp) => inp.seller?._id,
          },
          order: { type: "number", title: ta("رتبه") },
          isActive: { type: "bool", title: ta("فعال") },
          price: { type: "number", title: ta("قیمت"), price: true },
          discount: { type: "number", title: ta("تخفیف"), price: true },
          special: { type: "bool", title: ta("ویژه") },
          freeDelivery: { type: "bool", title: ta("ارسال رایگان") },
          fastDelivery: { type: "bool", title: ta("ارسال سریغ") },
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
          title={ta("فروشندگان")}
          actions={[
            {
              title: ta("جدید"),
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
                name: ta("فروشنده"),
                value: (node) => node.seller?.name || node.seller?._id,
                component: (node) =>
                  node.seller ? (
                    <InlineLink
                      href={adminPath(`/pharmacy/${node.seller._id}`)}
                    >
                      {node.seller.name || node.seller._id}
                    </InlineLink>
                  ) : (
                    ta("حذف شده")
                  ),
                filter: "Multi",
              },
              price: {
                name: ta("قیمت"),
                value: (node) => node.price,
                component: (node) =>
                  node.price ? currencize(node.price) : "—",
                filter: "Number",
              },
              discount: {
                name: ta("تخفیف"),
                value: (node) => node.discount,
                component: (node) =>
                  node.discount ? currencize(node.discount) : "—",
                filter: "Number",
              },
              isActive: {
                name: ta("وضعیت"),
                value: (node) => booleanToValue[`${node.isActive}`],
                component: (node) => <BooleanToIcon value={node.isActive} />,
                filter: "Set",
              },
              fastDelivery: {
                name: ta("تحویل سریع"),
                value: (node) => booleanToValue[`${node.fastDelivery}`],
                filter: "Set",
                component: (node) => (
                  <BooleanToIcon value={node.fastDelivery} />
                ),
              },
              freeDelivery: {
                name: ta("ارسال رایگان"),
                value: (node) => booleanToValue[`${node.freeDelivery}`],
                filter: "Set",
                component: (node) => (
                  <BooleanToIcon value={node.freeDelivery} />
                ),
              },
              order: {
                name: ta("رتبه"),
                value: (node) => node.order,
                filter: "Number",
                component: (node) => (
                  <OrderEditor
                    value={node.order}
                    modelName="productSeller"
                    mutate={mutate}
                    _id={node._id}
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
                    <IconButton
                      variant="Danger"
                      title={ta("حذف")}
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
                title: ta("جزئیات"),
              },
              {
                id: "Images",
                content: <ProductImagesManager product={data} />,
                title: ta("تصاویر"),
              },
              {
                id: "Specs",
                content: <ProductSpecsManager product={data} />,
                title: ta("ویژگی ها"),
              },
              {
                id: "Sellers",
                content: <ProductSellersManager product={data} />,
                title: ta("فروشندگان"),
              },
              {
                id: "Meta",
                title: ta("متادیتا"),
                content: (
                  <PageMetaEditor
                    resourceType="/product/[slug]"
                    slug={data.slug}
                  />
                ),
              },
            ]}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageProductPage;
