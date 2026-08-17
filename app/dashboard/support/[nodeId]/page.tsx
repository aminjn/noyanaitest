import TicketPage from "@/Components/Dashboard/Support/TicketPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const Ticket = async () => {
  const textContent = await getScopedTextContent(["common", "dashboardSupport"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "dashboardSupport"]}
      initialTextContent={textContent}
    >
      <TicketPage />
    </LocaleScopeProvider>
  );
};

export default Ticket;
