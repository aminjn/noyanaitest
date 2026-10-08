import MedicalCenterDepartments from "../Clinic/MedicalCenterDepartments";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import { HospitalPageNode, liveHospitalClinics } from "./HospitalPage";
import classes from "./HospitalPageClinics.module.css";

const HospitalPageClinics = ({ node }: { node: HospitalPageNode }) => {
  return (
    <MedicalCenterDepartments
      title="hospitalClinics"
      id="clinics"
      departments={liveHospitalClinics(node.clinics).map((el) => ({
        doctors: el.clinic.doctors
          .map((d) => d.doctor)
          .filter(Boolean) as IDoctorProfile<{
          MainSpecialityPopulated: Record<never, never>;
        }>[],
        name: el.clinic.name,
        href: `/clinic/${el.clinic.slug || el.clinic._id}`,
        phone: el.clinic.phone,
        summary: el.clinic.summary,
      }))}
    />
  );
};

export default HospitalPageClinics;
