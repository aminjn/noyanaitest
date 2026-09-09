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
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import { ILicensePricingEntry } from "../UI/LicensePricingInput";

// Menu items available in the insurance dashboard (InsurancePanelSidebar).
// Kept in sync with Models/BaseInsuranceLicense.ts on noyanai-back and with
// the `title` values in Components/Layout/InsurancePanelSidebar.tsx
// (excluding "logout", which is an action, not a menu). Mirrors
// Components/Admin/BaseHospitalLicense/AdminManageBaseHospitalLicensesPage.tsx.
export const insuranceDashboardModules = [
  "profile",
  "secrataries",
  "licenses",
  "articles",
] as const;

export type InsuranceDashboardModule =
  (typeof insuranceDashboardModules)[number];

export const insuranceDashboardModuleLabels: Record<
  InsuranceDashboardModule,
  string
> = {
  profile: "پروفایل",
  secrataries: "منشی ها",
  licenses: "مجوزها",
  articles: "مقالات",
};

export type BaseInsuranceLicensePopulation = Population<Record<never, never>>;

export interface IBaseInsuranceLicense<
  T extends BaseInsuranceLicensePopulation = BaseInsuranceLicensePopulation,
> extends MongoDoc {
  displayName?: string;
  order: number;
  isDefault: boolean;
  // One pricing option per Models/LicenseDuration.ts catalog entry, edited
  // via the "licensePricing" CreateForm field type below.
  pricing: ILicensePricingEntry[];
  descriptions: string[];
  modules: InsuranceDashboardModule[];
  isRecommended: boolean;
  isDiscounted: boolean;
  isActive: boolean;
  // Whether this plan is part of the "primary" lineup shown on the main
  // license page (backend filters GET /insurance/license on isActive AND
  // isPrimary) - an isActive plan that isn't isPrimary is still purchasable
  // via its direct id or the "see all plans" listing, just not featured.
  isPrimary: boolean;
  isGolden: boolean;
  summary: string;
  details: string;
}

export const baseInsuranceLicenseFormRenderer: FormRenderer<IBaseInsuranceLicense> =
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
      options: insuranceDashboardModuleLabels,
    },
  };

const AdminManageBaseInsuranceLicensesPage = () => {
  const { setPopup } = usePopup();

  return (
    <NodesManager<IBaseInsuranceLicense>
      create={baseInsuranceLicenseFormRenderer}
      modelName="baseInsuranceLicense"
      title="پلن های مجوز بیمه"
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
              modelName="baseInsuranceLicense"
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
        actions: {
          name: "عملیات",
          component: (node) => (
            <TableActions>
              <IconLink href={adminPath(`/baseInsuranceLicense/${node._id}`)}>
                <EyeIcon />
              </IconLink>
              <IconButton
                onClick={() =>
                  setPopup(
                    "Delete",
                    <DeleteShitPopup
                      mutate={mutate}
                      modelName="baseInsuranceLicense"
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

export default AdminManageBaseInsuranceLicensesPage;
