import DoctorManageClinicsPage from "@/Components/DoctorPanel/Clinic/DoctorManageClinicsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManageClinics = async () => {
  const textContent = await getScopedTextContent(["common", "doctorPanelClinic"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "doctorPanelClinic"]}
      initialTextContent={textContent}
    >
      <DoctorManageClinicsPage />
    </LocaleScopeProvider>
  );
};

export default DoctorManageClinics;
