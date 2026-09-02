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
  monthlyPrice: number;
  monthlyDiscount: number;
  annualPrice: number;
  annualDiscount: number;
  descriptions: string[];
  modules: DoctorDashboardModule[];
}

export const baseDoctorLicenseFormRenderer: FormRenderer<IBaseDoctorLicense> =
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
              modelName="baseDoctorLicense"
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
              <IconLink href={adminPath(`/baseDoctorLicense/${node._id}`)}>
                <EyeIcon />
              </IconLink>
              <IconButton
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
