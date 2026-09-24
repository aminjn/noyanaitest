import PharmacyFillPrescriptionPage from "@/Components/PharmacyPanel/Prescription/PharmacyFillPrescriptionPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const PharmacyFillPrescription = async () => {
  const textContent = await getScopedTextContent([
    "pharmacyPanelPrescription",
  ]);
  return (
    <LocaleScopeProvider
      namespaces={["pharmacyPanelPrescription"]}
      initialTextContent={textContent}
    >
      <PharmacyFillPrescriptionPage />
    </LocaleScopeProvider>
  );
};

export default PharmacyFillPrescription;
