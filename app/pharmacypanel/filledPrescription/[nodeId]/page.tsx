import FilledPrescriptionPage from "@/Components/PharmacyPanel/FilledPrescription/FilledPrescriptionPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const FilledPrescription = async () => {
  const textContent = await getScopedTextContent([
    "pharmacyPanelFilledPrescription",
  ]);
  return (
    <LocaleScopeProvider
      namespaces={["pharmacyPanelFilledPrescription"]}
      initialTextContent={textContent}
    >
      <FilledPrescriptionPage />
    </LocaleScopeProvider>
  );
};

export default FilledPrescription;
