import Button from "@/Components/UI/Button";
import List from "../UI/List";
import classes from "./AdminManageDoctorActionsTab.module.css";
import { IDoctor } from "./AdminManageDoctorsPage";
import usePopup from "@/Components/Hooks/usePopup";
import DeleteDoctorPopup from "./DeleteDoctorPopup";
import useProgress from "@/Components/Hooks/useProgress";
import { adminPath } from "@/Components/helpers/adminPath";
import CloneDoctorProfileFromExistingDoctorPopup from "../BecomeDoctor/CloneDoctorProfileFromExistingDoctorPopup";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageDoctorActionsTab = ({ node }: { node: IDoctor }) => {
  const { setPopup } = usePopup();

  const push = useProgress();

  const hasAccess = useAccessLevel();

  return (
    <List>
      {hasAccess("DoctorProfile", "write") && (
        <Button
          onClick={() =>
            setPopup(
              "CloneDoctorProfileFromExistingDoctor",
              <CloneDoctorProfileFromExistingDoctorPopup
                mutate={() => {}}
                doctor={node}
              />,
            )
          }
        >
          {ta("ساخت پروفایل از روی این پزشک")}
        </Button>
      )}
      {hasAccess("Doctor", "delete") && (
        <Button
          variant="Error"
          onClick={() =>
            setPopup(
              "DeleteDoctor",
              <DeleteDoctorPopup
                node={node}
                mutate={() => push(adminPath(`/doctor`))}
              />,
            )
          }
        >
          {ta("حذف این پزشک")}
        </Button>
      )}
    </List>
  );
};

export default AdminManageDoctorActionsTab;
