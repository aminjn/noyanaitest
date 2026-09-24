import { ReactNode } from "react";
import BecomeLayout from "@/Components/Become/BecomeLayout";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

// Shared shell for every /become/[org] route plus /become itself - see
// Components/Become/BecomeLayout.tsx for what it actually gates/renders.
const Become = async ({ children }: { children: ReactNode }) => {
  const textContent = await getScopedTextContent(["becomeSomething"]);
  return (
    <LocaleScopeProvider
      namespaces={["becomeSomething"]}
      initialTextContent={textContent}
    >
      <BecomeLayout>{children}</BecomeLayout>
    </LocaleScopeProvider>
  );
};

export default Become;
