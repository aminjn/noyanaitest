import CreateByNamePopup from "../UI/CreateByNamePopup";
import { ta } from "@/Components/Admin/i18n/adminText";

// asks for the name first (Components/Admin/UI/CreateByNamePopup.tsx) -
// opening it no longer creates an empty disease
const CreateNewDiseasePopup = ({ mutate }: { mutate: () => unknown }) => (
  <CreateByNamePopup
    modelName="disease"
    title={ta("بیماری جدید")}
    fieldTitle={ta("نام بیماری")}
    editPath={(id) => `/disease/${id}`}
    mutate={mutate}
  />
);

export default CreateNewDiseasePopup;
