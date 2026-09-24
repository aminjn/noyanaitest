import DoctorManageChatsClient from "@/Components/DoctorPanel/_Stub/DoctorManageChatsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManageChats = async () => {
  const textContent = await getScopedTextContent(["common", "doctorPanelStub", "chat"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "doctorPanelStub", "chat"]}
      initialTextContent={textContent}
    >
      <DoctorManageChatsClient />
    </LocaleScopeProvider>
  );
};

export default DoctorManageChats;
