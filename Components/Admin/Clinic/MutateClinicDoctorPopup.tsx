import PopupCard from "@/Components/UI/PopupCard";
import { API } from "@/Components/config";
import { IDoctor } from "../Doctor/AdminManageDoctorsPage";
import CreateForm from "../UI/CreateForm";
import {
  IClinic,
  IClinicDepartment,
  IClinicDoctor,
} from "./AdminManageClinicsPage";
import usePopup from "@/Components/Hooks/usePopup";
import {
  getClinicDepartmentLabel,
  getDoctorProfileLabel,
} from "../Lib/LabelGetters";
import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";

const MutateClinicDoctorPopup = ({
  mutate,
  clinic,
  node,
}: {
  node?: IClinicDoctor<{
    DepartmentPopulated: Record<string, boolean | undefined>;
    DoctorPopulated: Record<string, boolean | undefined>;
  }>;
  clinic: IClinic;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();
  return (
    <PopupCard title="پزشک کلینیک">
      <CreateForm
        defaultValue={node}
        hookProps={{
          path: `${API}/auto/clinicdoctor${node ? `/${node._id}` : ""}`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
          mutator: node ? undefined : (inp) => ({ ...inp, clinic: clinic._id }),
        }}
        onCancel={() => closePopup()}
        renderer={{
          department: {
            path: `${API}/auto/clinicdepartment?clinic=${clinic._id}`,
            title: "دپارتمان",
            type: "nodes",
            getOptionLabel: (node) =>
              getClinicDepartmentLabel(node as IClinicDepartment),
            getOptionValue: (node) => (node as IClinicDepartment)._id,
            getDefaultValue: (node) => node.department?._id,
          },
          doctor: {
            path: `${API}/auto/doctorprofile`,
            title: "پزشک",
            type: "nodes",
            getOptionLabel: (node) =>
              getDoctorProfileLabel(node as IDoctorProfile),
            getOptionValue: (node) => (node as IDoctor)._id,
            getDefaultValue: (node) => node.doctor?._id,
          },
        }}
      />
    </PopupCard>
  );
};

export default MutateClinicDoctorPopup;
