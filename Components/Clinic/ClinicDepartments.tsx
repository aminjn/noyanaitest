import classes from "./ClinicDepartments.module.css";
import { ClinicPageNode } from "./ClinicPage";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";

import MedicalCenterDepartments from "./MedicalCenterDepartments";

const ClinicDepartments = ({ node }: { node: ClinicPageNode }) => {
  return (
    <MedicalCenterDepartments
      title="clinicDepartments"
      departments={node.departments.map((el) => ({
        name: el.name,
        phone: el.phone,
        summary: el.summary,
        // the department's own doctors (the backend lists them per
        // department), not every member of the clinic
        doctors: (Array.isArray(el.doctors) ? el.doctors : [])
          .map((d) => d?.doctor)
          .filter(Boolean) as IDoctorProfile<{
          MainSpecialityPopulated: Record<never, never>;
        }>[],
      }))}
    />
  );
};

export default ClinicDepartments;
