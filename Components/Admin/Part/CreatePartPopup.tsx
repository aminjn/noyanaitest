import CreateByNamePopup from "../UI/CreateByNamePopup";

// asks for the name first (Components/Admin/UI/CreateByNamePopup.tsx) -
// opening it no longer creates an empty part
const CreatePartPopup = ({ mutate }: { mutate: () => unknown }) => (
  <CreateByNamePopup
    modelName="part"
    title="بخش جدید"
    fieldTitle="نام بخش"
    editPath={(id) => `/part/${id}`}
    mutate={mutate}
  />
);

export default CreatePartPopup;
