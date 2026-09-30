"use client";

import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import DoctorCommissionTab from "./DoctorCommissionTab";
import DoctorTaxTab from "./DoctorTaxTab";
import classes from "./DoctorFinanceTab.module.css";
import { ta } from "@/Components/Admin/i18n/adminText";

// Commission and tax used to be two tabs of their own. Both are read by the
// backend (Lib/commission.ts at payout time - reservationProgressService /
// orderSettlementService; Lib/taxSettings.ts on bookings and doctor
// services in the cart), so they stay, as the two parts of one «مالی» tab.
const DoctorFinanceTab = ({ node }: { node: IDoctorProfile }) => {
  return (
    <div className={classes.main}>
      <section className={classes.section}>
        <h3 className={classes.title}>{ta("کمیسیون")}</h3>
        <p className={classes.hint}>
          {ta(
            "سهم پلتفرم از درآمد این پزشک که هنگام تسویه کسر می‌شود؛ به قیمت بیمار اضافه نمی‌شود.",
          )}
        </p>
        <DoctorCommissionTab node={node} />
      </section>
      <section className={classes.section}>
        <h3 className={classes.title}>{ta("مالیات")}</h3>
        <p className={classes.hint}>
          {ta(
            "درصد مالیاتی که روی ویزیت‌ها و خدمات این پزشک به صورتحساب بیمار اضافه می‌شود. خالی = پیش‌فرض سیستم.",
          )}
        </p>
        <DoctorTaxTab node={node} />
      </section>
    </div>
  );
};

export default DoctorFinanceTab;
