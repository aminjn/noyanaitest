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

// Menu items available in the doctor dashboard (DoctorSidebar). Kept in
// sync with Models/BaseDoctorLicense.ts on noyanai-back and with the
// `title` values in Components/Layout/DoctorSidebar.tsx (excluding
// "logout", which is an action, not a menu).
export const doctorDashboardModules = [
  "dashboard",
  "profile",
  "office",
  "services",
  "servicePackages",
  "incomingOrders",
  "financialMangement",
  "secrataries",
  "shifts",
  "schedule",
  "patients",
  "licenses",
  "clinics",
  "hospitals",
  "phrmaciesAndLabs",
  "insurances",
  "offers",
  "discounts",
  "articles",
  "chatWithPatients",
  "drugsAndPrescriptions",
  "patientDocuments",
  "settings",
] as const;

export type DoctorDashboardModule = (typeof doctorDashboardModules)[number];

export const doctorDashboardModuleLabels: Record<
  DoctorDashboardModule,
  string
> = {
  dashboard: "داشبورد",
  profile: "پروفایل",
  office: "مطب",
  services: "خدمات",
  servicePackages: "پکیج های خدمات",
  incomingOrders: "سفارش های ورودی",
  financialMangement: "مدیریت مالی",
  secrataries: "منشی ها",
  shifts: "شیفت ها",
  schedule: "برنامه زمانی",
  patients: "بیماران",
  licenses: "مجوزها",
  clinics: "کلینیک ها",
  hospitals: "بیمارستان ها",
  phrmaciesAndLabs: "داروخانه ها و آزمایشگاه ها",
  insurances: "بیمه ها",
  offers: "پیشنهادها",
  discounts: "تخفیف ها",
  articles: "مقالات",
  chatWithPatients: "گفتگو با بیماران",
  drugsAndPrescriptions: "داروها و نسخه ها",
  patientDocuments: "مدارک بیماران",
  settings: "تنظیمات",
};

export type BaseDoctorLicensePopulation = Population<Record<never, never>>;

export interface IBaseDoctorLicense<
  T extends BaseDoctorLicensePopulation = BaseDoctorLicensePopulation,
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
  modules: DoctorDashboardModule[];
  isRecommended: boolean;
  isDiscounted: boolean;
  isActive: boolean;
  // Whether this plan is part of the "primary" lineup shown on the main
  // license page (backend filters GET /doctor/license on isActive AND
  // isPrimary) - an isActive plan that isn't isPrimary is still purchasable
  // via its direct id or the "see all plans" listing, just not featured.
  isPrimary: boolean;
  isGolden: boolean;
  summary: string;
  details: string;
}

export const baseDoctorLicenseFormRenderer: FormRenderer<IBaseDoctorLicense> = {
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
    options: doctorDashboardModuleLabels,
  },
};

const AdminManageBaseDoctorLicensesPage = () => {
  const { setPopup } = usePopup();

  return (
    <NodesManager<IBaseDoctorLicense>
      create={baseDoctorLicenseFormRenderer}
      modelName="baseDoctorLicense"
      title="پلن های مجوز پزشک"
      table={({ mutate }) => ({
        displayName: {
          name: "نام پلن",
          value: (node) => node.displayName,
          filter: "Text",
        },
        isActive: {
          name: "وضعیت",
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
        modules: {
          name: "منوها",
          value: (node) => node.modules?.length ?? 0,
          filter: "Number",
        },
        order: {
          name: "ترتیب",
          value: (node) => node.order,
          filter: "Number",
          component: (node) => (
            <OrderEditor
              modelName="baseDoctorLicense"
              mutate={mutate}
              value={node.order}
              _id={node._id}
            />
          ),
        },
        actions: {
          name: "عملیات",
          component: (node) => (
            <TableActions>
              <IconLink
                href={adminPath(`/baseDoctorLicense/${node._id}`)}
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
                      modelName="baseDoctorLicense"
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

export default AdminManageBaseDoctorLicensesPage;
