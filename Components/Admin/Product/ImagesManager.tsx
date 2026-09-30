import useSWR from "swr";
import {
  IProductImage,
  ProductSpecModel,
  ProductSpecRefPath,
} from "./AdminManageProductsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import usePopup from "@/Components/Hooks/usePopup";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import PopupCard from "@/Components/UI/PopupCard";
import CreateForm from "../UI/CreateForm";
import { Fragment, useState } from "react";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import Table from "../UI/Table";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import InlineLink from "../UI/InlineLink";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import EditIcon from "@/Components/Icons/EditIcon";
import OrderEditor from "../UI/OrderEditor";
import { ta } from "@/Components/Admin/i18n/adminText";

const DeleteProductImagePopup = ({
  mutate,
  node,
}: {
  node: IProductImage;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { closePopup } = usePopup();
  return (
    <Fragment>
      <ConfirmationPopup
        message={ta("آیا از حذف این مورد مطمئنید؟")}
        isLoading={isLoading}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/auto/productImage/${node._id}` : null}
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

const MutateProductImagePopup = ({
  mutate,
  node,
  product,
  model,
}: {
  mutate: () => unknown;
  model: ProductSpecRefPath;
} & (
  | {
      node: IProductImage;
      product?: never;
    }
  | { product: ProductSpecModel; node?: never }
)) => {
  const { closePopup } = usePopup();
  return (
    <PopupCard title={node ? ta("ویرایش تصویر محصول") : ta("تصویر محصول جدید")}>
      <CreateForm
        onCancel={() => closePopup()}
        defaultValue={node}
        renderer={{
          image: { type: "image", title: ta("نصویر") },
          alt: { type: "text", title: ta("الت") },
          isActive: { type: "bool", title: ta("فعال") },
          order: { type: "number", title: ta("رتبه") },
        }}
        hookProps={{
          path: `${API}/auto/productImage${node ? `/${node._id}` : ""}`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
          decorators: product
            ? { product: product._id, refPath: model }
            : undefined,
        }}
      />
    </PopupCard>
  );
};

const ImagesManager = ({
  node,
  model,
}: {
  node: ProductSpecModel;
  model: ProductSpecRefPath;
}) => {
  const { data, error, mutate } = useSWR<IProductImage[]>(
    `${API}/auto/productImage?product=${node._id}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={ta("تصاویر")}
          actions={[
            {
              title: ta("جدید"),
              action: () =>
                setPopup(
                  "MutateProductImage",
                  <MutateProductImagePopup
                    product={node}
                    mutate={mutate}
                    model={model}
                  />,
                ),
            },
          ]}
        >
          <Table
            name="AdminManageProductImages"
            data={data}
            renderer={{
              image: {
                name: ta("تصویر"),
                value: (node) => node.image,
                filter: "Text",
                component: (node) =>
                  node.image ? (
                    <InlineLink target="_blank" href={`/files/${node.image}`}>
                      {ta("مشاهده تصویر")}
                    </InlineLink>
                  ) : (
                    "—"
                  ),
              },
              alt: {
                name: ta("متن جایگزین"),
                value: (node) => node.alt,
                filter: "Text",
              },
              isActive: {
                name: ta("فعال"),
                filter: "Set",
                value: (node) => booleanToValue[`${!!node.isActive}`],
                component: (node) => <BooleanToIcon value={node.isActive} />,
              },
              order: {
                name: ta("رتبه"),
                value: (node) => node.order,
                filter: "Number",
                component: (node) => (
                  <OrderEditor
                    _id={node._id}
                    modelName="productImage"
                    mutate={mutate}
                    value={node.order}
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
                          "MutateProductImage",
                          <MutateProductImagePopup
                            node={node}
                            mutate={mutate}
                            model={model}
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
                          "DeleteProductImage",
                          <DeleteProductImagePopup
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

export default ImagesManager;
