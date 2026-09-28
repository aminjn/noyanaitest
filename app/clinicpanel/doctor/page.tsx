import CenterDoctorsPage from "@/Components/_Common/CenterDoctors/CenterDoctorsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const ClinicDoctors = async () => {
  const textContent = await getScopedTextContent(["centerDoctors"]);
  return (
    <LocaleScopeProvider namespaces={["centerDoctors"]} initialTextContent={textContent}>
      <CenterDoctorsPage kind="clinic" panel="clinicpanel" />
    </LocaleScopeProvider>
  );
};

export default ClinicDoctors;
