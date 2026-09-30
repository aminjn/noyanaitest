import { IClinic } from "./AdminManageClinicsPage";
import PanelOwnerSection from "./PanelOwnerSection";
import RemoveUserFromClinicPopup from "./RemoveUserFromClinicPopup";
import { ta } from "@/Components/Admin/i18n/adminText";

// The «مالک پنل» part of the team tab (see PanelOwnerSection).
const ClinicUserTab = ({
  mutate,
  node,
}: {
  node: IClinic<{ User: Record<never, never> }>;
  mutate: () => unknown;
}) => (
  <PanelOwnerSection
    node={node}
    mutate={mutate}
    modelName="clinic"
    removePopup={<RemoveUserFromClinicPopup node={node} mutate={mutate} />}
    removeTitle={ta("حذف یوزر از روی این کلینیک")}
  />
);

export default ClinicUserTab;
