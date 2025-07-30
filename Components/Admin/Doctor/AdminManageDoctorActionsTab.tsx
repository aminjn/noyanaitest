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
              />
            )
          }
        >
          ساخت پروفایل از روی این پزشک
        </Button>
      )}
      {hasAccess("Doctor", "delete") && (
        <Button
          variant="Danger"
          onClick={() =>
            setPopup(
              "DeleteDoctor",
              <DeleteDoctorPopup
                node={node}
                mutate={() => push(adminPath(`/doctor`))}
              />
            )
          }
        >
          حذف این پزشک
        </Button>
      )}
    </List>
  );
};

export default AdminManageDoctorActionsTab;
