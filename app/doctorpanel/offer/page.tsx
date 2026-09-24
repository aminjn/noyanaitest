import DoctorManageOffersClient from "@/Components/DoctorPanel/_Stub/DoctorManageOffersPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManageOffers = async () => {
  const textContent = await getScopedTextContent(["doctorPanelStub"]);
  return (
    <LocaleScopeProvider
      namespaces={["doctorPanelStub"]}
      initialTextContent={textContent}
    >
      <DoctorManageOffersClient />
    </LocaleScopeProvider>
  );
};

export default DoctorManageOffers;
