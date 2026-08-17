import DoctorManageChatsClient from "@/Components/DoctorPanel/_Stub/DoctorManageChatsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManageChats = async () => {
  const textContent = await getScopedTextContent(["common", "doctorPanelStub"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "doctorPanelStub"]}
      initialTextContent={textContent}
    >
      <DoctorManageChatsClient />
    </LocaleScopeProvider>
  );
};

export default DoctorManageChats;
