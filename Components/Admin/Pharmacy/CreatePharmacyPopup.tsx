import CreateByNamePopup from "../UI/CreateByNamePopup";
import { ta } from "@/Components/Admin/i18n/adminText";

// asks for the name first (Components/Admin/UI/CreateByNamePopup.tsx) -
// opening it no longer creates an empty pharmacy
const CreatePharmacyPopup = ({ mutate }: { mutate: () => unknown }) => (
  <CreateByNamePopup
    modelName="pharmacy"
    title={ta("داروخانه‌ی جدید")}
    fieldTitle={ta("نام داروخانه")}
    editPath={(id) => `/pharmacy/${id}`}
    mutate={mutate}
  />
);

export default CreatePharmacyPopup;
