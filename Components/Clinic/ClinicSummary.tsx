import { ClinicPageNode } from "./ClinicPage";
import classes from "./ClinicSummary.module.css";
import MedicalCenterSummary from "./MedicalCenterSummary";

const ClinicSummary = ({ node }: { node: ClinicPageNode }) => {
  return (
    <MedicalCenterSummary
      code={node.clinicCode}
      doctorCount={node.doctors.length}
      establishment={node.establishment}
      personelCount={node.personelCount}
      summary={node.summary}
      description={node.description}
    />
  );
};

export default ClinicSummary;
