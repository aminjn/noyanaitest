import useSWR from "swr";
import {
  IProduct,
  IProductSpec,
  ProductSpecModel,
  ProductSpecRefPath,
} from "./AdminManageProductsPage";
import { IProductPackage } from "../ProductPackage/AdminManageProductPackagesPage";
import { fetcher } from "@/Components/helpers/fetcher";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import { Fragment, useState } from "react";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import PopupCard from "@/Components/UI/PopupCard";
import CreateForm from "../UI/CreateForm";
import Table from "../UI/Table";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import EditIcon from "@/Components/Icons/EditIcon";
import OrderEditor from "../UI/OrderEditor";
import { ta } from "@/Components/Admin/i18n/adminText";

const DeleteProductSpecPopup = ({
  mutate,
  node,
}: {
  mutate: () => unknown;
  node: IProductSpec;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  return (
    <Fragment>
      <ConfirmationPopup
        isLoading={isLoading}
        message={ta("آیا از حذف این مورد مطمئنید؟")}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/auto/productSpec/${node._id}` : null}
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

const MutateProductSpecPopup = ({
  mutate,
  node,
  product,
  model,
}: { mutate: () => unknown; model: ProductSpecRefPath } & (
  | { node: IProductSpec; product?: never }
  | { node?: never; product: ProductSpecModel }
)) => {
  const { closePopup } = usePopup();

  return (
    <PopupCard>
      <CreateForm
        onCancel={() => {
          closePopup();
        }}
        renderer={{
          order: { type: "number", title: ta("رتبه") },
          isActive: { type: "bool", title: ta("فعال") },
          title: { type: "text", title: ta("عنوان") },
          content: { type: "text", title: ta("مقدار") },
        }}
        defaultValue={node}
        hookProps={{
          path: `${API}/auto/productSpec${node ? `/${node._id}` : ""}`,
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

const SpecsManager = ({
  node,
  model,
}: {
  node: ProductSpecModel;
  model: ProductSpecRefPath;
}) => {
  const { data, error, mutate } = useSWR<IProductSpec[]>(
    `${API}/auto/productSpec?product=${node._id}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={ta("ویژگی ها")}
          actions={[
            {
              title: ta("جدید"),
              action: () =>
                setPopup(
                  "MutateProductSpec",
                  <MutateProductSpecPopup
                    product={node}
                    mutate={mutate}
                    model={model}
                  />,
                ),
            },
          ]}
        >
          <Table
            name="AdminManageProductSpecs"
            data={data}
            renderer={{
              title: {
                name: ta("عنوان"),
                value: (node) => node.title,
                filter: "Text",
              },
              content: {
                name: ta("مقدار"),
                value: (node) => node.content,
                filter: "Text",
              },
              isActive: {
                name: ta("وضعیت"),
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
                    _id={node._id}
                    value={node.order}
                    mutate={mutate}
                    modelName="productSpec"
                  />
                ),
              },
              actions: {
                name: ta("عملیات"),
                component: (node) => (
                  <TableActions>
                    <IconButton
                      variant="Info"
                      title={ta("ویرایش")}
                      onClick={() =>
                        setPopup(
                          "MutateProductSpec",
                          <MutateProductSpecPopup
                            mutate={mutate}
                            node={node}
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
                          "DeleteProductSpec",
                          <DeleteProductSpecPopup
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

export default SpecsManager;
