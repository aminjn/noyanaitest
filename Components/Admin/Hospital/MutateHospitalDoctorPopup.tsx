import PopupCard from "@/Components/UI/PopupCard";
import { API } from "@/Components/config";
import { IDoctor } from "../Doctor/AdminManageDoctorsPage";
import CreateForm from "../UI/CreateForm";
import {
  IHospital,
  IHospitalDepartment,
  IHospitalDoctor,
} from "./AdminManageHospitalsPage";
import usePopup from "@/Components/Hooks/usePopup";
import {
  getHospitalDepartmentLabel,
  getDoctorProfileLabel,
} from "../Lib/LabelGetters";
import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";

const MutateHospitalDoctorPopup = ({
  mutate,
  hospital,
  node,
}: {
  node?: IHospitalDoctor<{
    DepartmentPopulated: Record<string, boolean | undefined>;
    DoctorPopulated: Record<string, boolean | undefined>;
  }>;
  hospital: IHospital;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();
  return (
    <PopupCard title="پزشک بیمارستان">
      <CreateForm
        defaultValue={node}
        hookProps={{
          path: `${API}/auto/hospitaldoctor${node ? `/${node._id}` : ""}`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
          mutator: node ? undefined : (inp) => ({ ...inp, hospital: hospital._id }),
        }}
        onCancel={() => closePopup()}
        renderer={{
          department: {
            path: `${API}/auto/hospitaldepartment?hospital=${hospital._id}`,
            title: "دپارتمان",
            type: "nodes",
            getOptionLabel: (node) =>
              getHospitalDepartmentLabel(node as IHospitalDepartment),
            getOptionValue: (node) => (node as IHospitalDepartment)._id,
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

export default MutateHospitalDoctorPopup;
