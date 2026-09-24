import PrintPrescriptionPage from "@/Components/DoctorPanel/Prescription/Print/PrintPrescriptionPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const PrintPrescription = async () => {
  const textContent = await getScopedTextContent([
    "doctorPanelPrescriptionPrint",
  ]);
  return (
    <LocaleScopeProvider
      namespaces={["doctorPanelPrescriptionPrint"]}
      initialTextContent={textContent}
    >
      <PrintPrescriptionPage />
    </LocaleScopeProvider>
  );
};

export default PrintPrescription;
