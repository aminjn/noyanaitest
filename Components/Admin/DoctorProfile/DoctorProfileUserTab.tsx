import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import CreateForm from "../UI/CreateForm";
import { API } from "@/Components/config";
import { IUser } from "@/Components/Hooks/useUser";
import { getUserLabel } from "../Lib/LabelGetters";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import { ta } from "@/Components/Admin/i18n/adminText";
import classes from "./DoctorFinanceTab.module.css";

// The user account that signs in to this doctor's panel (/doctorpanel).
// Giving an imported, unclaimed directory profile an owner makes it
// claimed - bookable - the same as the become-doctor approval does
// (adminEntityController: claimed = true when the profile gets its user);
// before, an admin-assigned owner left the profile unbookable.
const DoctorProfileUserTab = ({
  mutate,
  node,
}: {
  node: IDoctorProfile;
  mutate: () => unknown;
}) => {
  const hasAccess = useAccessLevel();
  return (
    <div className={classes.section}>
      <p className={classes.hint}>
        {ta(
          "حساب کاربری‌ای که وارد پنل این پزشک می‌شود و نوبت‌ها، پیام‌ها و درآمد را مدیریت می‌کند.",
        )}
      </p>
      <CreateForm<IDoctorProfile>
        readOnly={!hasAccess("DoctorProfile", "update")}
        defaultValue={node}
        hookProps={{
          path: `${API}/auto/doctorprofile/${node._id}`,
          method: "POST",
          mutator: (inp) => (inp.user ? { ...inp, claimed: true } : inp),
          successCb: () => {
            mutate();
          },
        }}
        styleManaged
        renderer={{
          user: {
            type: "nodes",
            multi: false,
            path: `${API}/auto/user`,
            title: ta("مالک پنل"),
            getOptionLabel: (node) => getUserLabel(node as IUser),
            getOptionValue: (node) => (node as IUser)._id,
            getDefaultValue: (node) => node.user,
          },
        }}
      />
    </div>
  );
};

export default DoctorProfileUserTab;
