import BecomeADoctorPage from "@/Components/DoctorPanel/BecomeADoctorPage";

// Reuses the existing, working medical-system-code lookup flow as-is (also
// embedded inline by DoctorPanelLayout when a logged-in doctor-to-be visits
// /doctorpanel with no profile yet) - see Components/Become/becomeOrgs.ts
// for why doctor doesn't get a bare name-only form like the other 5 orgs.
const BecomeDoctor = () => {
  return <BecomeADoctorPage />;
};

export default BecomeDoctor;
