import { IClinic } from "./AdminManageClinicsPage";
import PanelOwnerSection from "./PanelOwnerSection";

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
  />
);

export default ClinicUserTab;
