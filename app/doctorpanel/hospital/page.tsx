import DoctorManageHospitalsPage from "@/Components/DoctorPanel/Hospital/DoctorManageHospitalsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManageHospitals = async () => {
  const textContent = await getScopedTextContent(["doctorPanelHospital"]);
  return (
    <LocaleScopeProvider
      namespaces={["doctorPanelHospital"]}
      initialTextContent={textContent}
    >
      <DoctorManageHospitalsPage />
    </LocaleScopeProvider>
  );
};

export default DoctorManageHospitals;
