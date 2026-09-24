import BecomeADoctorPage from "@/Components/DoctorPanel/BecomeADoctorPage";
import {
  getListPageMetadata,
  getListPageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";

export const generateMetadata = () => getListPageMetadata("/become/doctor");

// Reuses the existing, working medical-system-code lookup flow as-is (also
// embedded inline by DoctorPanelLayout when a logged-in doctor-to-be visits
// /doctorpanel with no profile yet) - see Components/Become/becomeOrgs.ts
// for why doctor doesn't get a bare name-only form like the other 5 orgs.
const BecomeDoctor = async () => {
  const webSchema = await getListPageWebSchema("/become/doctor");
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <BecomeADoctorPage />
    </>
  );
};

export default BecomeDoctor;
