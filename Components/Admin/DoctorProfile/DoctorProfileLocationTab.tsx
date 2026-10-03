import { API } from "@/Components/config";
import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import AdminLocationTab from "../UI/AdminLocationTab";
import { ta } from "@/Components/Admin/i18n/adminText";

// The office point, address and the province / city / district it falls
// in, through the shared AdminLocationTab like the centre record pages.
const DoctorProfileLocationTab = ({
  mutate,
  node,
}: {
  node: IDoctorProfile;
  mutate: () => unknown;
}) => (
  <AdminLocationTab
    path={`${API}/auto/doctorprofile/${node._id}`}
    node={node as never}
    mutate={mutate}
    hint={ta(
      "روی نقشه، محل مطب را انتخاب کنید؛ جستجوی «نزدیک من»، نقشه‌ی سایت و استان و شهر پزشک از همین نقطه می‌آیند.",
    )}
  />
);

export default DoctorProfileLocationTab;
