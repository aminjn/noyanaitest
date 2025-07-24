import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import classes from "./DoctorProfileUserTab.module.css";
import CreateForm from "../UI/CreateForm";
import { API } from "@/Components/config";
import { IUser } from "@/Components/Hooks/useUser";

const DoctorProfileUserTab = ({
  mutate,
  node,
}: {
  node: IDoctorProfile;
  mutate: () => unknown;
}) => {
  return (
    <CreateForm
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
          getOptionLabel: (node) => (node as IUser).phone,
          getOptionValue: (node) => (node as IUser)._id,
          getDefaultValue: (node) => node.user,
        },
      }}
    />
  );
};

export default DoctorProfileUserTab;
