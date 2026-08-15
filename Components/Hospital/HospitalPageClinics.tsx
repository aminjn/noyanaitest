import { IClinic } from "../Admin/Clinic/AdminManageClinicsPage";
import { IHospitalClinic } from "../Admin/Hospital/AdminManageHospitalPage";
import MedicalCenterDepartments from "../Clinic/MedicalCenterDepartments";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import useLocale from "../Hooks/useLocale";
import BuildingIcon from "../Icons/BuildingIcon";
import Badge from "../UI/Badge";
import IconTitle from "../UI/IconTitle";
import { HospitalPageNode } from "./HospitalPage";
import classes from "./HospitalPageClinics.module.css";

const HospitalPageClinics = ({ node }: { node: HospitalPageNode }) => {
  console.log(node);

  return (
    <MedicalCenterDepartments
      title="hospitalClinics"
      departments={node.clinics.map((el) => ({
        doctors: el.clinic.doctors
          .map((d) => d.doctor)
          .filter(Boolean) as IDoctorProfile<{
          MainSpecialityPopulated: Record<never, never>;
        }>[],
        name: el.clinic.name,
        phone: el.clinic.phone,
        summary: el.clinic.summary,
      }))}
    />
  );
};

export default HospitalPageClinics;
