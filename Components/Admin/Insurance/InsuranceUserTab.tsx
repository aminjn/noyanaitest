import { IInsurance } from "@/Components/DoctorPanel/Insurance/DoctorInsurancesTab";
import PanelOwnerSection from "../Clinic/PanelOwnerSection";

// The «مالک پنل» part of the team tab (see PanelOwnerSection).
const InsuranceUserTab = ({
  mutate,
  node,
}: {
  node: IInsurance<{ User: Record<never, never> }>;
  mutate: () => unknown;
}) => (
  <PanelOwnerSection
    node={node}
    mutate={mutate}
    modelName="insurance"
  />
);

export default InsuranceUserTab;
