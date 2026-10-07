import MyInsurancesPage from "@/Components/Dashboard/Insurance/MyInsurancesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "patientInsurance"];

// «بیمه‌های من» (2026-10): the patient's basic and supplementary insurances
const DashboardMyInsurances = async () => {
  const textContent = await getScopedTextContent(NS);
  return (
    <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
      <MyInsurancesPage />
    </LocaleScopeProvider>
  );
};

export default DashboardMyInsurances;
