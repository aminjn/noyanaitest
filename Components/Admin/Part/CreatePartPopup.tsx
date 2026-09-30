import CreateByNamePopup from "../UI/CreateByNamePopup";
import { ta } from "@/Components/Admin/i18n/adminText";

// asks for the name first (Components/Admin/UI/CreateByNamePopup.tsx) -
// opening it no longer creates an empty part
const CreatePartPopup = ({ mutate }: { mutate: () => unknown }) => (
  <CreateByNamePopup
    modelName="part"
    title={ta("بخش جدید")}
    fieldTitle={ta("نام بخش")}
    editPath={(id) => `/part/${id}`}
    mutate={mutate}
  />
);

export default CreatePartPopup;
