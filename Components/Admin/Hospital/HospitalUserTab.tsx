import { IHospital } from "./AdminManageHospitalsPage";
import PanelOwnerSection from "../Clinic/PanelOwnerSection";
import RemoveUserFromHospitalPopup from "./RemoveUserFromHospitalPopup";
import { ta } from "@/Components/Admin/i18n/adminText";

// The «مالک پنل» part of the team tab (see PanelOwnerSection).
const HospitalUserTab = ({
  mutate,
  node,
}: {
  node: IHospital<{ User: Record<never, never> }>;
  mutate: () => unknown;
}) => (
  <PanelOwnerSection
    node={node}
    mutate={mutate}
    modelName="hospital"
    removePopup={<RemoveUserFromHospitalPopup node={node} mutate={mutate} />}
    removeTitle={ta("حذف یوزر از روی این بیمارستان")}
  />
);

export default HospitalUserTab;
