import DoctorManageServicePackagePage from "@/Components/DoctorPanel/ServicePackage/DoctorManageServicePackagePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManageServicePackageById = async () => {
  const textContent = await getScopedTextContent([
    "common",
    "doctorPanelServicePackage",
  ]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "doctorPanelServicePackage"]}
      initialTextContent={textContent}
    >
      <DoctorManageServicePackagePage />
    </LocaleScopeProvider>
  );
};

export default DoctorManageServicePackageById;
