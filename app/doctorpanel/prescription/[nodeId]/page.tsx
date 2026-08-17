import PrescriptionOverviewPage from "@/Components/DoctorPanel/Prescription/Overview/PrescriptionOverviewPage";
import PreviewPrescription2Page from "@/Components/DoctorPanel/Prescription2/Preview/PreviewPrescription2Page";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const PrescriptionOverview = async () => {
  const textContent = await getScopedTextContent([
    "common",
    "doctorPanelPrescriptionCreate",
  ]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "doctorPanelPrescriptionCreate"]}
      initialTextContent={textContent}
    >
      <PreviewPrescription2Page />
      {/* <PrescriptionOverviewPage /> */}
    </LocaleScopeProvider>
  );
};

export default PrescriptionOverview;
