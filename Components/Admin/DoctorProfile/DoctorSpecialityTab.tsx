import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import classes from "./DoctorSpecialityTab.module.css";
import { mutate } from "swr";
import CreateForm from "../UI/CreateForm";
import { API } from "@/Components/config";
import { ISpeciality } from "../Speciality/AdminManageSpecialitiesPage";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import { ta } from "@/Components/Admin/i18n/adminText";

const DoctorSpecialityTab = ({
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
      styleManaged
      defaultValue={node}
      hookProps={{
        path: `${API}/auto/doctorprofile/${node._id}`,
        method: "POST",
        successCb: () => {
          mutate();
        },
      }}
      renderer={{
        mainSpeciality: {
          title: ta("تخصص اصلی"),
          type: "nodes",
          path: `${API}/auto/speciality`,
          getOptionLabel: (node) =>
            (node as ISpeciality).name || (node as ISpeciality)._id,
          getOptionValue: (node) => (node as ISpeciality)._id,
          getDefaultValue: (node) => node.mainSpeciality,
        },
        specialities: {
          title: ta("تخصص ها"),
          type: "nodes",
          path: `${API}/auto/speciality`,
          multi: true,
          getOptionLabel: (node) =>
            (node as ISpeciality).name || (node as ISpeciality)._id,
          getOptionValue: (node) => (node as ISpeciality)._id,
          getDefaultValue: (node) => node.specialities,
        },
      }}
    />
  );
};

export default DoctorSpecialityTab;
