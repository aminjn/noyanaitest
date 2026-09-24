import ChatPage from "@/Components/Chat/ChatPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const Chat = async () => {
  const textContent = await getScopedTextContent(["common", "dashboardChat", "chat"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "dashboardChat", "chat"]}
      initialTextContent={textContent}
    >
      <ChatPage />
    </LocaleScopeProvider>
  );
};

export default Chat;
