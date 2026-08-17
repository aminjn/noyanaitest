import DoctorManageDiscountsClient from "@/Components/DoctorPanel/_Stub/DoctorManageDiscountsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManageDiscounts = async () => {
  const textContent = await getScopedTextContent(["common", "doctorPanelStub"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "doctorPanelStub"]}
      initialTextContent={textContent}
    >
      <DoctorManageDiscountsClient />
    </LocaleScopeProvider>
  );
};

export default DoctorManageDiscounts;
