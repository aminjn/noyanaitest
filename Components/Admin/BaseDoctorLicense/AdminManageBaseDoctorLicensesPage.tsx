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
import { ta } from "@/Components/Admin/i18n/adminText";

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
  // Noyan Business (2026-10): the books
  "accounting",
  // Noyan Business phase 3 (2026-10): employees, payslips, insurance and tax
  "payroll",
] as const;

export type DoctorDashboardModule = (typeof doctorDashboardModules)[number];

export const doctorDashboardModuleLabels: Record<
  DoctorDashboardModule,
  string
> = {
  get dashboard() {
  return ta("داشبورد");
},
  get profile() {
  return ta("پروفایل");
},
  get office() {
  return ta("مطب");
},
  get services() {
  return ta("خدمات");
},
  get servicePackages() {
  return ta("پکیج های خدمات");
},
  get incomingOrders() {
  return ta("سفارش های ورودی");
},
  get financialMangement() {
  return ta("مدیریت مالی");
},
  get secrataries() {
  return ta("منشی ها");
},
  get shifts() {
  return ta("شیفت ها");
},
  get schedule() {
  return ta("برنامه زمانی");
},
  get patients() {
  return ta("بیماران");
},
  get licenses() {
  return ta("مجوزها");
},
  get clinics() {
  return ta("کلینیک ها");
},
  get hospitals() {
  return ta("بیمارستان ها");
},
  get phrmaciesAndLabs() {
  return ta("داروخانه ها و آزمایشگاه ها");
},
  get insurances() {
  return ta("بیمه ها");
},
  get offers() {
  return ta("پیشنهادها");
},
  get discounts() {
  return ta("تخفیف ها");
},
  get articles() {
  return ta("مقالات");
},
  get chatWithPatients() {
  return ta("گفتگو با بیماران");
},
  get drugsAndPrescriptions() {
  return ta("داروها و نسخه ها");
},
  get patientDocuments() {
  return ta("مدارک بیماران");
},
  get settings() {
  return ta("تنظیمات");
},
  get accounting() {
  return ta("حسابداری");
},
  get payroll() {
  return ta("حقوق و دستمزد");
},
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
  displayName: { get title() {
  return ta("نام نمایشی");
}, type: "text" },
  order: { get title() {
  return ta("رتبه");
}, type: "number" },
  isDefault: { get title() {
  return ta("پیش فرض");
}, type: "bool" },
  isRecommended: { get title() {
  return ta("پیشنهادی");
}, type: "bool" },
  isDiscounted: { get title() {
  return ta("تخفیف دار");
}, type: "bool" },
  isActive: { get title() {
  return ta("فعال");
}, type: "bool" },
  isPrimary: { get title() {
  return ta("پلن اصلی");
}, type: "bool" },
  isGolden: { get title() {
  return ta("طلایی");
}, type: "bool" },
  pricing: { get title() {
  return ta("قیمت‌گذاری");
}, type: "licensePricing" },
  descriptions: { get title() {
  return ta("توضیحات");
}, type: "strings" },
  summary: { get title() {
  return ta("خلاصه");
}, type: "text" },
  details: { get title() {
  return ta("جزئیات");
}, type: "rtf" },
  modules: {
    get title() {
  return ta("منوهای قابل دسترسی");
},
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
      title={ta("پلن های مجوز پزشک")}
      table={({ mutate }) => ({
        displayName: {
          name: ta("نام پلن"),
          value: (node) => node.displayName,
          filter: "Text",
        },
        isActive: {
          name: ta("وضعیت"),
          value: (node) => booleanToValue[`${node.isActive}`],
          component: (node) => <BooleanToIcon value={node.isActive} />,
          filter: "Set",
        },
        isPrimary: {
          name: ta("پلن اصلی"),
          value: (node) => booleanToValue[`${node.isPrimary}`],
          component: (node) => <BooleanToIcon value={node.isPrimary} />,
          filter: "Set",
        },
        isDefault: {
          name: ta("پیش‌فرض"),
          value: (node) => booleanToValue[`${node.isDefault}`],
          component: (node) => <BooleanToIcon value={node.isDefault} />,
          filter: "Set",
        },
        modules: {
          name: ta("منوها"),
          value: (node) => node.modules?.length ?? 0,
          filter: "Number",
        },
        order: {
          name: ta("ترتیب"),
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
          name: ta("عملیات"),
          component: (node) => (
            <TableActions>
              <IconLink
                href={adminPath(`/baseDoctorLicense/${node._id}`)}
                title={ta("ویرایش")}
              >
                <EditIcon />
              </IconLink>
              <IconButton
                variant="Danger"
                title={ta("حذف")}
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
