import { IHospital } from "./AdminManageHospitalsPage";
import PanelOwnerSection from "../Clinic/PanelOwnerSection";

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
  />
);

export default HospitalUserTab;
