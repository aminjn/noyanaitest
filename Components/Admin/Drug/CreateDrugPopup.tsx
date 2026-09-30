import CreateByNamePopup from "../UI/CreateByNamePopup";
import { ta } from "@/Components/Admin/i18n/adminText";

// asks for the name first (Components/Admin/UI/CreateByNamePopup.tsx) -
// opening it no longer creates an empty drug
const CreateDrugPopup = ({ mutate }: { mutate: () => unknown }) => (
  <CreateByNamePopup
    modelName="drug"
    title={ta("داروی جدید")}
    fieldTitle={ta("نام دارو")}
    editPath={(id) => `/drug/${id}`}
    mutate={mutate}
  />
);

export default CreateDrugPopup;
