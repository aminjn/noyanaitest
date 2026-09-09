import BecomeSomethingPage from "@/Components/Become/BecomeSomethingPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { redirect } from "next/navigation";

const Become = async () => {
  return redirect("/become/doctor");
  // const textContent = await getScopedTextContent(["becomeSomething"]);
  // return (
  //   <LocaleScopeProvider
  //     namespaces={["becomeSomething"]}
  //     initialTextContent={textContent}
  //   >
  //     <BecomeSomethingPage />
  //   </LocaleScopeProvider>
  // );
};

export default Become;
