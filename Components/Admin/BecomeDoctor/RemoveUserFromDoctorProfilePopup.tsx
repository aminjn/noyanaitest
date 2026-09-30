import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import classes from "./RemoveUserFromDoctorProfilePopup.module.css";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import { Fragment, useState } from "react";
import { getDoctorProfileLabel, getUserLabel } from "../Lib/LabelGetters";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";
import { ta } from "@/Components/Admin/i18n/adminText";

const RemoveUserFromDoctorProfilePopup = ({
  mutate,
  profile,
}: {
  profile: IDoctorProfile<{ UserPopulated: Record<never, never> }>;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { closePopup } = usePopup();

  return (
    <Fragment>
      <ConfirmationPopup
        message={ta("آیا از حذف پروفایل ${1} از کاربر ${2} مطمئنید؟", [getDoctorProfileLabel(
          profile
        ), profile.user ? getUserLabel(profile.user) : ""])}
        onConfirm={() => setIsLoading(true)}
        isLoading={isLoading}
      />
      <Act
        path={isLoading ? `${API}/admin/doctorprofile/${profile._id}` : null}
        method="PUT"
        onDone={(status) => {
          setIsLoading(false);
          if (!status) return;
          mutate();
          closePopup();
        }}
      />
    </Fragment>
  );
};

export default RemoveUserFromDoctorProfilePopup;
