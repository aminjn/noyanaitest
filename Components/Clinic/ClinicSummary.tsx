import { ClinicPageNode } from "./ClinicPage";
import classes from "./ClinicSummary.module.css";
import MedicalCenterSummary from "./MedicalCenterSummary";

const ClinicSummary = ({ node }: { node: ClinicPageNode }) => {
  return (
    <MedicalCenterSummary
      code={node.clinicCode}
      doctorCount={Array.isArray(node.doctors) ? node.doctors.filter((m) => !!m?.doctor).length : 0}
      roundTheClock={!!node.isRoundTheClock}
      establishment={node.establishment}
      personelCount={node.personelCount}
      summary={node.summary}
      description={node.description}
    />
  );
};

export default ClinicSummary;
