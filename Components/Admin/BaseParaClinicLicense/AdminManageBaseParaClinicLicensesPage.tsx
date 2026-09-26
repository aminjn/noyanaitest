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
import EditIcon from "@/Components/Icons/EditIcon";
import { FormRenderer } from "../UI/CreateForm";
import OrderEditor from "../UI/OrderEditor";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import { ILicensePricingEntry } from "../UI/LicensePricingInput";

// Menu items available in the paraClinic dashboard (ParaClinicSidebar). Kept
// in sync with Models/BaseParaClinicLicense.ts on noyanai-back and with the
// `target` values in Components/Layout/ParaClinicSidebar.tsx (excluding
// "secretary", which is owner-only, never gated). Mirrors
// Components/Admin/BasePharmacyLicense/AdminManageBasePharmacyLicensesPage.tsx.
export const paraClinicDashboardModules = [
  "profile",
  "secrataries",
  "tests",
  "incomingOrders",
  "tamin",
  "articles",
  "licenses",
] as const;

export type ParaClinicDashboardModule =
  (typeof paraClinicDashboardModules)[number];

export const paraClinicDashboardModuleLabels: Record<
  ParaClinicDashboardModule,
  string
> = {
  profile: "پروفایل",
  secrataries: "منشی ها",
  tests: "آزمایشات",
  incomingOrders: "سفارش های ورودی",
  tamin: "تامین",
  articles: "مقالات",
  licenses: "مجوزها",
};

export type BaseParaClinicLicensePopulation = Population<Record<never, never>>;

export interface IBaseParaClinicLicense<
  T extends BaseParaClinicLicensePopulation = BaseParaClinicLicensePopulation,
> extends MongoDoc {
  displayName?: string;
  order: number;
  isDefault: boolean;
  // Replaces the old flat monthlyPrice/monthlyDiscount/annualPrice/
  // annualDiscount fields (2026-09) - one pricing option per
  // Models/LicenseDuration.ts catalog entry, edited via the
  // "licensePricing" CreateForm field type below.
  pricing: ILicensePricingEntry[];
  descriptions: string[];
  modules: ParaClinicDashboardModule[];
  isRecommended: boolean;
  isDiscounted: boolean;
  isActive: boolean;
  // Whether this plan is part of the "primary" lineup shown on the main
  // license page (backend filters GET /paraClinic/license on isActive AND
  // isPrimary) - an isActive plan that isn't isPrimary is still purchasable
  // via its direct id or the "see all plans" listing, just not featured.
  isPrimary: boolean;
  isGolden: boolean;
  summary: string;
  details: string;
}

export const baseParaClinicLicenseFormRenderer: FormRenderer<IBaseParaClinicLicense> =
  {
    displayName: { title: "نام نمایشی", type: "text" },
    order: { title: "رتبه", type: "number" },
    isDefault: { title: "پیش فرض", type: "bool" },
    isRecommended: { title: "پیشنهادی", type: "bool" },
    isDiscounted: { title: "تخفیف دار", type: "bool" },
    isActive: { title: "فعال", type: "bool" },
    isPrimary: { title: "پلن اصلی", type: "bool" },
    isGolden: { title: "طلایی", type: "bool" },
    pricing: { title: "قیمت‌گذاری", type: "licensePricing" },
    descriptions: { title: "توضیحات", type: "strings" },
    summary: { title: "خلاصه", type: "text" },
    details: { title: "جزئیات", type: "rtf" },
    modules: {
      title: "منوهای قابل دسترسی",
      type: "multiselect",
      options: paraClinicDashboardModuleLabels,
    },
  };

const AdminManageBaseParaClinicLicensesPage = () => {
  const { setPopup } = usePopup();

  return (
    <NodesManager<IBaseParaClinicLicense>
      create={baseParaClinicLicenseFormRenderer}
      modelName="baseParaClinicLicense"
      title="پلن های مجوز پاراکلینیک"
      table={({ mutate }) => ({
        displayName: {
          name: "نام نمایشی",
          value: (node) => node.displayName,
          filter: "Text",
        },
        order: {
          name: "ترتیب",
          value: (node) => node.order,
          filter: "Number",
          component: (node) => (
            <OrderEditor
              modelName="baseParaClinicLicense"
              mutate={mutate}
              value={node.order}
              _id={node._id}
            />
          ),
        },
        isActive: {
          name: "فعال",
          value: (node) => booleanToValue[`${node.isActive}`],
          component: (node) => <BooleanToIcon value={node.isActive} />,
          filter: "Set",
        },
        isPrimary: {
          name: "پلن اصلی",
          value: (node) => booleanToValue[`${node.isPrimary}`],
          component: (node) => <BooleanToIcon value={node.isPrimary} />,
          filter: "Set",
        },
        isDefault: {
          name: "پیش‌فرض",
          value: (node) => booleanToValue[`${node.isDefault}`],
          component: (node) => <BooleanToIcon value={node.isDefault} />,
          filter: "Set",
        },
        actions: {
          name: "عملیات",
          component: (node) => (
            <TableActions>
              <IconLink
                href={adminPath(`/baseParaClinicLicense/${node._id}`)}
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
                      mutate={mutate}
                      modelName="baseParaClinicLicense"
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

export default AdminManageBaseParaClinicLicensesPage;
