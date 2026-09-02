"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import NodesManager from "../UI/NodesManager";
import { Population } from "../Clinic/AdminManageClinicsPage";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import usePopup from "@/Components/Hooks/usePopup";
import DeleteShitPopup from "../UI/DeleteShitPopup";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import IconLink from "../UI/IconLink";
import { adminPath } from "@/Components/helpers/adminPath";
import EyeIcon from "@/Components/Icons/EyeIcon";
import { FormRenderer } from "../UI/CreateForm";
import OrderEditor from "../UI/OrderEditor";
import { currencize } from "@/Components/helpers/currencize";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";

// Menu items available in the pharmacy dashboard (PharmacyPanelSidebar).
// Kept in sync with Models/BasePharmacyLicense.ts on noyanai-back and with
// the `title` values in Components/Layout/PharmacyPanelSidebar.tsx
// (excluding "logout", which is an action, not a menu). Mirrors
// Components/Admin/BaseDoctorLicense/AdminManageBaseDoctorLicensesPage.tsx.
export const pharmacyDashboardModules = [
  "profile",
  "secrataries",
  "products",
  "productPackages",
  "incomingOrders",
  "licenses",
  "prescriptions",
  "tamin",
  "articles",
] as const;

export type PharmacyDashboardModule = (typeof pharmacyDashboardModules)[number];

export const pharmacyDashboardModuleLabels: Record<
  PharmacyDashboardModule,
  string
> = {
  profile: "پروفایل",
  secrataries: "منشی ها",
  products: "محصولات",
  productPackages: "پکیج های محصولات",
  incomingOrders: "سفارش های ورودی",
  licenses: "مجوزها",
  prescriptions: "نسخه ها",
  tamin: "تامین",
  articles: "مقالات",
};

export type BasePharmacyLicensePopulation = Population<Record<never, never>>;

export interface IBasePharmacyLicense<
  T extends BasePharmacyLicensePopulation = BasePharmacyLicensePopulation,
> extends MongoDoc {
  displayName?: string;
  order: number;
  isDefault: boolean;
  monthlyPrice: number;
  monthlyDiscount: number;
  annualPrice: number;
  annualDiscount: number;
  descriptions: string[];
  modules: PharmacyDashboardModule[];
}

export const basePharmacyLicenseFormRenderer: FormRenderer<IBasePharmacyLicense> =
  {
    displayName: { title: "نام نمایشی", type: "text" },
    order: { title: "رتبه", type: "number" },
    isDefault: { title: "پیش فرض", type: "bool" },
    monthlyPrice: { title: "قیمت ماهانه", type: "number", price: true },
    monthlyDiscount: { title: "تخفیف ماهانه", type: "number", price: true },
    annualPrice: { title: "قیمت سالانه", type: "number", price: true },
    annualDiscount: { title: "تخفیف سالانه", type: "number", price: true },
    descriptions: { title: "توضیحات", type: "strings" },
    modules: {
      title: "منوهای قابل دسترسی",
      type: "multiselect",
      options: pharmacyDashboardModuleLabels,
    },
  };

const AdminManageBasePharmacyLicensesPage = () => {
  const { setPopup } = usePopup();

  return (
    <NodesManager<IBasePharmacyLicense>
      create={basePharmacyLicenseFormRenderer}
      modelName="basePharmacyLicense"
      title="پلن های مجوز داروخانه"
      table={({ mutate }) => ({
        displayName: {
          name: "نام نمایشی",
          value: (node) => node.displayName,
          filter: "Text",
        },
        order: {
          name: "رتبه",
          value: (node) => node.order,
          filter: "Number",
          component: (node) => (
            <OrderEditor
              modelName="basePharmacyLicense"
              mutate={mutate}
              value={node.order}
              _id={node._id}
            />
          ),
        },
        isDefault: {
          name: "پیش فرض",
          value: (node) => booleanToValue[`${node.isDefault}`],
          component: (node) => <BooleanToIcon value={node.isDefault} />,
          filter: "Set",
        },
        monthlyPrice: {
          name: "قیمت ماهانه",
          value: (node) => node.monthlyPrice,
          component: (node) => currencize(node.monthlyPrice),
          filter: "Number",
        },
        monthlyDiscount: {
          name: "تخفیف ماهانه",
          value: (node) => node.monthlyDiscount,
          component: (node) => currencize(node.monthlyDiscount || 0),
          filter: "Number",
        },
        annualPrice: {
          name: "قیمت سالانه",
          value: (node) => node.annualPrice,
          component: (node) => currencize(node.annualPrice),
          filter: "Number",
        },
        annualDiscount: {
          name: "تخفیف سالانه",
          value: (node) => node.annualDiscount,
          component: (node) => currencize(node.annualDiscount || 0),
          filter: "Number",
        },
        actions: {
          name: "عملیات",
          component: (node) => (
            <TableActions>
              <IconLink href={adminPath(`/basePharmacyLicense/${node._id}`)}>
                <EyeIcon />
              </IconLink>
              <IconButton
                onClick={() =>
                  setPopup(
                    "Delete",
                    <DeleteShitPopup
                      mutate={mutate}
                      modelName="basePharmacyLicense"
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

export default AdminManageBasePharmacyLicensesPage;
