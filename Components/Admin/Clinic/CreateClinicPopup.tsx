import CreateByNamePopup from "../UI/CreateByNamePopup";
import { ta } from "@/Components/Admin/i18n/adminText";

// asks for the name first (Components/Admin/UI/CreateByNamePopup.tsx) -
// opening it no longer creates an empty clinic
const CreateClinicPopup = ({ mutate }: { mutate: () => unknown }) => (
  <CreateByNamePopup
    modelName="clinic"
    title={ta("کلینیک جدید")}
    fieldTitle={ta("نام کلینیک")}
    editPath={(id) => `/clinic/${id}`}
    mutate={mutate}
  />
);

export default CreateClinicPopup;
