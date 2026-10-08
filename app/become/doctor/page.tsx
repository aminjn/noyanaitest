import BecomeADoctorPage from "@/Components/DoctorPanel/BecomeADoctorPage";
import {
  getListPageMetadata,
  getListPageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = [
  "becomeSomething",
  "doctorPanelBecomeDoctor",
];

export const generateMetadata = () => getListPageMetadata("/become/doctor");

// The one doctor onboarding flow (2026-10; also embedded inline by
// DoctorPanelLayout when a logged-in doctor-to-be visits /doctorpanel with
// no profile yet) - see Components/Become/becomeOrgs.ts.
const BecomeDoctor = async () => {
  const [textContent, webSchema] = await Promise.all([
    getScopedTextContent(NS),
    getListPageWebSchema("/become/doctor"),
  ]);
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
        <BecomeADoctorPage />
      </LocaleScopeProvider>
    </>
  );
};

export default BecomeDoctor;
