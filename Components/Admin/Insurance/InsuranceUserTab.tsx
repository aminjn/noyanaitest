import { IInsurance } from "@/Components/DoctorPanel/Insurance/DoctorInsurancesTab";
import PanelOwnerSection from "../Clinic/PanelOwnerSection";
import RemoveUserFromInsurancePopup from "./RemoveUserFromInsurancePopup";
import { ta } from "@/Components/Admin/i18n/adminText";

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
    removePopup={<RemoveUserFromInsurancePopup node={node} mutate={mutate} />}
    removeTitle={ta("حذف یوزر از روی این بیمه")}
  />
);

export default InsuranceUserTab;
