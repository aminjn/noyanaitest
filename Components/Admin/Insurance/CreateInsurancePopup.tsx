import CreateByNamePopup from "../UI/CreateByNamePopup";
import { ta } from "@/Components/Admin/i18n/adminText";

// asks for the name first (Components/Admin/UI/CreateByNamePopup.tsx) -
// opening it no longer creates an empty insurance
const CreateInsurancePopup = ({ mutate }: { mutate: () => unknown }) => (
  <CreateByNamePopup
    modelName="insurance"
    title={ta("بیمه‌ی جدید")}
    fieldTitle={ta("نام بیمه")}
    editPath={(id) => `/insurance/${id}`}
    mutate={mutate}
  />
);

export default CreateInsurancePopup;
