import ChatsPage from "@/Components/Chat/ChatsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const Chats = async () => {
  const textContent = await getScopedTextContent(["common", "dashboardChat", "chat"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "dashboardChat", "chat"]}
      initialTextContent={textContent}
    >
      <ChatsPage />
    </LocaleScopeProvider>
  );
};

export default Chats;
