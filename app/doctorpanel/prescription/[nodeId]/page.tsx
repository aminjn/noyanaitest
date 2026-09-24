import PrescriptionOverviewPage from "@/Components/DoctorPanel/Prescription/Overview/PrescriptionOverviewPage";
import PreviewPrescription2Page from "@/Components/DoctorPanel/Prescription2/Preview/PreviewPrescription2Page";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NAMESPACES: ContentNamespace[] = [
  "common",
  "doctorPanelPrescriptionCreate",
  "doctorPanelPrescriptionDrugItem",
];

const PrescriptionOverview = async () => {
  const textContent = await getScopedTextContent(NAMESPACES);
  return (
    <LocaleScopeProvider
      namespaces={NAMESPACES}
      initialTextContent={textContent}
    >
      <PreviewPrescription2Page />
      {/* <PrescriptionOverviewPage /> */}
    </LocaleScopeProvider>
  );
};

export default PrescriptionOverview;
