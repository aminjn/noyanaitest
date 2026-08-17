import ChatPage from "@/Components/Chat/ChatPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const Chat = async () => {
  const textContent = await getScopedTextContent(["common", "dashboardChat"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "dashboardChat"]}
      initialTextContent={textContent}
    >
      <ChatPage />
    </LocaleScopeProvider>
  );
};

export default Chat;
