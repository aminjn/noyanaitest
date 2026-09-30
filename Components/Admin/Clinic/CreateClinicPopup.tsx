import CreateByNamePopup from "../UI/CreateByNamePopup";

// asks for the name first (Components/Admin/UI/CreateByNamePopup.tsx) -
// opening it no longer creates an empty clinic
const CreateClinicPopup = ({ mutate }: { mutate: () => unknown }) => (
  <CreateByNamePopup
    modelName="clinic"
    title="کلینیک جدید"
    fieldTitle="نام کلینیک"
    editPath={(id) => `/clinic/${id}`}
    mutate={mutate}
  />
);

export default CreateClinicPopup;
