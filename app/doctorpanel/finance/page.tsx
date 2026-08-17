import DoctorManageFinanceClient from "@/Components/DoctorPanel/_Stub/DoctorManageFinancePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManageFinance = async () => {
  const textContent = await getScopedTextContent(["common", "doctorPanelStub"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "doctorPanelStub"]}
      initialTextContent={textContent}
    >
      <DoctorManageFinanceClient />
    </LocaleScopeProvider>
  );
};

export default DoctorManageFinance;
