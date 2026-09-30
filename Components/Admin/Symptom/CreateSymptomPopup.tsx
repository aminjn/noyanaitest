import CreateByNamePopup from "../UI/CreateByNamePopup";
import { ta } from "@/Components/Admin/i18n/adminText";

// asks for the name first (Components/Admin/UI/CreateByNamePopup.tsx) -
// opening it no longer creates an empty symptom
const CreateSymptomPopup = ({ mutate }: { mutate: () => unknown }) => (
  <CreateByNamePopup
    modelName="symptom"
    title={ta("علامت جدید")}
    fieldTitle={ta("نام علامت")}
    editPath={(id) => `/symptom/${id}`}
    mutate={mutate}
  />
);

export default CreateSymptomPopup;
