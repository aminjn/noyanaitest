"use client";
import {
  DoctorProfilePopulation,
  IDoctorProfile,
} from "@/Components/DoctorPanel/DoctorPanelPage";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import {
  IService,
  ServicePopulation,
} from "../Service/AdminManageServicesPage";
import {
  IServiceCategory,
  ServiceCategoryPopulation,
} from "../ServiceCategory/AdminManageServiceCategoriesPage";
import NodesManager from "../UI/NodesManager";
import { API } from "@/Components/config";
import { getDoctorProfileLabel } from "../Lib/LabelGetters";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import { currencize } from "@/Components/helpers/currencize";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import EyeIcon from "@/Components/Icons/EyeIcon";
import IconButton from "../UI/IconButton";
import usePopup from "@/Components/Hooks/usePopup";
import DeleteShitPopup from "../UI/DeleteShitPopup";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import {
  IProductImage,
  IProductSpec,
  ProductImagePopulation,
  ProductSpecPopulation,
} from "../Product/AdminManageProductsPage";

export type ServicePackagePopulation = Population<{
  Owner: DoctorProfilePopulation;
  Services: ServicePopulation;
  Category: ServiceCategoryPopulation;
  Images: ProductImagePopulation;
  Specs: ProductSpecPopulation;
  SameAs: ServicePackagePopulation;
}>;

export interface IServicePackage<
  T extends ServicePackagePopulation = ServicePackagePopulation,
> extends MongoDoc {
  name?: string;
  owner: T["Owner"] extends DoctorProfilePopulation
    ? IDoctorProfile<T["Owner"]>
    : string;
  services: T["Services"] extends ServicePopulation
    ? IService<T["Services"]>[]
    : string[];
  price: number;
  discount: number;
  category: T["Category"] extends ServiceCategoryPopulation
    ? IServiceCategory<T["Category"]>
    : string;
  isActive: boolean;
  order: number;
  image?: string;
  slug?: string;
  images: T["Images"] extends ProductImagePopulation
    ? IProductImage<T["Images"]>[]
    : never;
  specs: T["Specs"] extends ProductSpecPopulation
    ? IProductSpec<T["Specs"]>[]
    : never;
  sameAs: T["SameAs"] extends ServicePackagePopulation
    ? IServicePackage<T["SameAs"]>[]
    : string[];
  description?: string;
  whyChoose?: string;
  stages?: string;
  results?: string;
  summary?: string;
}

const AdminManageServicePackagesPage = () => {
  const { setPopup } = usePopup();
  return (
    <NodesManager<IServicePackage<{ Owner: Record<never, never> }>>
      create={{
        owner: {
          type: "nodes",
          title: "صاحب",
          path: `${API}/auto/doctorProfile`,
          getOptionLabel: (node) =>
            getDoctorProfileLabel(node as IDoctorProfile),
          getOptionValue: (node) => (node as IDoctorProfile)._id,
          multi: false,
        },
        name: { type: "text", title: "نام" },
      }}
      title="پکیج سرویس"
      modelName="servicePackage"
      table={({ mutate }) => ({
        name: { name: "نام", value: (node) => node.name, filter: "Text" },
        owner: {
          name: "صاحب",
          value: (node) => getDoctorProfileLabel(node.owner),
          component: (node) => (
            <InlineLink href={adminPath(`/doctorProfile/${node.owner._id}`)}>
              {getDoctorProfileLabel(node.owner)}
            </InlineLink>
          ),
          filter: "Multi",
        },
        services: {
          name: "تغداد اقلام",
          value: (node) => node.services.length,
          filter: "Number",
        },
        isActive: {
          name: "فعال",
          value: (node) => booleanToValue[`${node.isActive}`],
          component: (node) => <BooleanToIcon value={node.isActive} />,
          filter: "Set",
        },
        order: { name: "رتبه", value: (node) => node.order, filter: "Number" },
        price: {
          name: "قیمت",
          value: (node) => node.price,
          component: (node) => currencize(node.price),
          filter: "Number",
        },
        discount: {
          name: "تخفیف",
          value: (node) => node.discount,
          component: (node) => currencize(node.discount),
          filter: "Number",
        },
        actions: {
          name: "عملیات",
          component: (node) => (
            <TableActions>
              <IconLink href={adminPath(`/servicePackage/${node._id}`)}>
                <EyeIcon />
              </IconLink>
              <IconButton
                onClick={() =>
                  setPopup(
                    "Delete",
                    <DeleteShitPopup
                      modelName="servicePackage"
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
    />
  );
};

export default AdminManageServicePackagesPage;
