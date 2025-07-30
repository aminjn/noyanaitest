import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import classes from "./DoctorProfileUserTab.module.css";
import CreateForm from "../UI/CreateForm";
import { API } from "@/Components/config";
import { IUser } from "@/Components/Hooks/useUser";
import { getUserLabel } from "../Lib/LabelGetters";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";

const DoctorProfileUserTab = ({
  mutate,
  node,
}: {
  node: IDoctorProfile;
  mutate: () => unknown;
}) => {
  const hasAccess = useAccessLevel();
  return (
    <CreateForm
      readOnly={!hasAccess("DoctorProfile", "update")}
      defaultValue={node}
      hookProps={{
        path: `${API}/auto/doctorprofile/${node._id}`,
        method: "POST",
        successCb: () => {
          mutate();
        },
      }}
      styleManaged
      renderer={{
        user: {
          type: "nodes",
          path: `${API}/auto/user`,
          title: "کاربر",
          getOptionLabel: (node) => getUserLabel(node as IUser),
          getOptionValue: (node) => (node as IUser)._id,
          getDefaultValue: (node) => node.user,
        },
      }}
    />
  );
};

export default DoctorProfileUserTab;
