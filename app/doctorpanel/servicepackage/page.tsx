import DoctorManageServicePackagesPage from "@/Components/DoctorPanel/ServicePackage/DoctorManageServicePackagesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManageServicePackages = async () => {
  const textContent = await getScopedTextContent([
    "doctorPanelServicePackage",
  ]);
  return (
    <LocaleScopeProvider
      namespaces={["doctorPanelServicePackage"]}
      initialTextContent={textContent}
    >
      <DoctorManageServicePackagesPage />
    </LocaleScopeProvider>
  );
};

export default DoctorManageServicePackages;
