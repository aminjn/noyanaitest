"use client";

import {
  IPharmacy,
  PharmacyPopulation,
} from "@/Components/DoctorPanel/Pharmacy/DoctorPharmaciesTab";
import { Population } from "../Clinic/AdminManageClinicsPage";
import {
  IProductCategory,
  ProductCategoryPopulation,
} from "../ProductCategory/AdminManageProductCategoriesPage";
import {
  IProduct,
  IProductImage,
  IProductSpec,
  ProductImagePopulation,
  ProductPopulation,
  ProductSpecPopulation,
} from "../Product/AdminManageProductsPage";
import { MongoDoc } from "@/Components/Hooks/useUser";
import NodesManager from "../UI/NodesManager";
import { API } from "@/Components/config";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import { currencize } from "@/Components/helpers/currencize";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import EditIcon from "@/Components/Icons/EditIcon";
import IconButton from "../UI/IconButton";
import usePopup from "@/Components/Hooks/usePopup";
import DeleteShitPopup from "../UI/DeleteShitPopup";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import OrderEditor from "../UI/OrderEditor";

export type ProductPackagePopulation = Population<{
  Owner: PharmacyPopulation;
  Category: ProductCategoryPopulation;
  Products: ProductPopulation;
  Images: ProductImagePopulation;
  Specs: ProductSpecPopulation;
  SameAs: ProductPackagePopulation;
}>;

export interface IProductPackage<
  T extends ProductPackagePopulation = ProductPackagePopulation,
> extends MongoDoc {
  owner: T["Owner"] extends PharmacyPopulation ? IPharmacy<T["Owner"]> : string;
  name?: string;
  slug?: string;
  isActive: boolean;
  order: number;
  category?: T["Category"] extends ProductCategoryPopulation
    ? IProductCategory<T["Category"]>
    : string;
  image?: string;
  products: T["Products"] extends ProductPopulation
    ? IProduct<T["Products"]>[]
    : string[];
  price?: number;
  discount?: number;
  images: T["Images"] extends ProductImagePopulation
    ? IProductImage<T["Images"]>[]
    : never;
  specs: T["Specs"] extends ProductSpecPopulation
    ? IProductSpec<T["Specs"]>[]
    : never;
  sameAs: T["SameAs"] extends ProductPackagePopulation
    ? IProductPackage<T["SameAs"]>[]
    : string[];
  summary?: string;
  description?: string;
  whyChoose?: string;
  averageScore: number;
  commentCount: number;
}

const AdminManageProductPackagesPage = () => {
  const { setPopup } = usePopup();

  return (
    <NodesManager<IProductPackage<{ Owner: Record<never, never> }>>
      create={{
        owner: {
          type: "nodes",
          path: `${API}/auto/pharmacy`,
          title: "صاحب",
          multi: false,
          getOptionLabel: (node) =>
            (node as IPharmacy).name || (node as IPharmacy)._id,
          getOptionValue: (node) => (node as IPharmacy)._id,
        },
        name: { type: "text", title: "نام" },
      }}
      modelName="productPackage"
      table={({ mutate }) => ({
        name: { name: "نام", value: (node) => node.name, filter: "Text" },
        owner: {
          name: "صاحب",
          value: (node) => node.owner?.name,
          filter: "Multi",
          component: (node) =>
            node.owner ? (
              <InlineLink href={adminPath(`/pharmacy/${node.owner._id}`)}>
                {node.owner.name || node.owner._id}
              </InlineLink>
            ) : (
              "—"
            ),
        },
        price: {
          name: "قیمت",
          value: (node) => node.price,
          component: (node) => currencize(node.price || 0),
          filter: "Number",
        },
        discount: {
          name: "تخفیف",
          value: (node) => node.discount,
          filter: "Number",
          component: (node) => currencize(node.discount || 0),
        },
        isActive: {
          name: "وضعیت",
          value: (node) => booleanToValue[`${node.isActive}`],
          component: (node) => <BooleanToIcon value={node.isActive} />,
          filter: "Set",
        },
        order: {
          name: "رتبه",
          value: (node) => node.order,
          filter: "Number",
          component: (node) => (
            <OrderEditor
              _id={node._id}
              value={node.order}
              mutate={mutate}
              modelName="productPackage"
            />
          ),
        },
        actions: {
          name: "عملیات",
          component: (node) => (
            <TableActions>
              <IconLink
                href={adminPath(`/productPackage/${node._id}`)}
                title="ویرایش"
              >
                <EditIcon />
              </IconLink>
              <IconButton
                variant="Danger"
                title="حذف"
                onClick={() =>
                  setPopup(
                    "Delete",
                    <DeleteShitPopup
                      modelName="productPackage"
                      mutate={mutate}
                      nodeId={node._id}
                    />,
                  )
                }
              >
                <GarbageIcon />
              </IconButton>
            </TableActions>
          ),
        },
      })}
      title="بسته محصول"
    />
  );
};

export default AdminManageProductPackagesPage;
