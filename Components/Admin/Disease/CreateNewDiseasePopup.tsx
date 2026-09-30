import CreateByNamePopup from "../UI/CreateByNamePopup";

// asks for the name first (Components/Admin/UI/CreateByNamePopup.tsx) -
// opening it no longer creates an empty disease
const CreateNewDiseasePopup = ({ mutate }: { mutate: () => unknown }) => (
  <CreateByNamePopup
    modelName="disease"
    title="بیماری جدید"
    fieldTitle="نام بیماری"
    editPath={(id) => `/disease/${id}`}
    mutate={mutate}
  />
);

export default CreateNewDiseasePopup;
