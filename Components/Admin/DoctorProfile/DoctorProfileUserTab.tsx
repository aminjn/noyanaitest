import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import { ProviderOwnerEditor } from "../Clinic/PanelOwnerSection";
import { ta } from "@/Components/Admin/i18n/adminText";
import classes from "./DoctorFinanceTab.module.css";

// The user account that signs in to this doctor's panel (/doctorpanel).
// Saved through the audited PUT /admin/doctorprofile/<id>/owner, which also
// makes an imported, unclaimed directory profile claimed - bookable - the
// same as the become-doctor approval does; the account is found by server
// search instead of loading every user.
const DoctorProfileUserTab = ({
  mutate,
  node,
}: {
  node: IDoctorProfile;
  mutate: () => unknown;
}) => (
  <div className={classes.section}>
    <p className={classes.hint}>
      {ta(
        "حساب کاربری‌ای که وارد پنل این پزشک می‌شود و نوبت‌ها، پیام‌ها و درآمد را مدیریت می‌کند.",
      )}
    </p>
    <ProviderOwnerEditor
      kind="doctorprofile"
      node={node as unknown as { _id: string; user?: unknown }}
      mutate={mutate}
    />
  </div>
);

export default DoctorProfileUserTab;
