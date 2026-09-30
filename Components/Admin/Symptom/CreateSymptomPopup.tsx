import CreateByNamePopup from "../UI/CreateByNamePopup";

// asks for the name first (Components/Admin/UI/CreateByNamePopup.tsx) -
// opening it no longer creates an empty symptom
const CreateSymptomPopup = ({ mutate }: { mutate: () => unknown }) => (
  <CreateByNamePopup
    modelName="symptom"
    title="علامت جدید"
    fieldTitle="نام علامت"
    editPath={(id) => `/symptom/${id}`}
    mutate={mutate}
  />
);

export default CreateSymptomPopup;
